import { HandlerOptions } from '../server';
import { characterHealthText } from '../../utils/characterHealthText';
import { getEmitters } from '../../utils/emitHelper';
import { firstUpper } from '../../utils/firstUpper';
import { uniqueMatchCount } from '../../utils/uniqueMatchCount';
import { Item, ItemIds, ItemTypes, items } from '../items/items';
import { scenes } from '../scenes/scenes';
import { writeCharacterData } from '../../../sqlite/sqlite';
import { Character, ClassTypes, Horse, InventoryDescriptionHelper } from '../../types';
import { getCost, levelRequirementString, xpAmountString } from '../../utils/leveling';
import { captureFrom, makeMatcher, matchMatchesKeywords } from '../../utils/makeMatcher';
import { REGEX_DROP_ALIASES, REGEX_EQUIP_ALIASES, REGEX_EVAL_ALIASES, REGEX_GET_ALIASES, REGEX_INVENTORY_ALIASES, REGEX_LOOK_ALIASES, REGEX_SELF_ALIASES, REGEX_UNEQUIP_ALIASES } from '../../constants';
import { getEncumbranceString } from '../../utils/encumbrance';
import { saddlebagCapacityMap } from '../horse/horse';
import { errorParts } from '../../utils/log';

export function getWornItems (character: Character): Item[] {
  const worn: Item[] = [];
  if (character.headgear) worn.push(items.get(character.headgear));
  if (character.armor) worn.push(items.get(character.armor));
  if (character.gloves) worn.push(items.get(character.gloves));
  if (character.legwear) worn.push(items.get(character.legwear));
  if (character.footwear) worn.push(items.get(character.footwear));
  if (character.weapon) worn.push(items.get(character.weapon));
  if (character.offhand) worn.push(items.get(character.offhand));
  return worn;
}

export function getInventoryAndWorn (character: Character): Item[] {
  const result: Item[] = [];
  try {
    result.push(...character.inventory.map(i => items.get(i)));
    result.push(...getWornItems(character));
    return result;
  } catch (err) {
    errorParts(['Error in character.getInventoryAndWorn:', err.toString()]);
    errorParts(['character state:', character]);
    return result;
  }
}

export function handleCharacterCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { name } = character;
  const { emitSelf, emitOthers } = getEmitters(socket, character.scene_id);

  // look at yourself
  if (command.match(makeMatcher(REGEX_LOOK_ALIASES, REGEX_SELF_ALIASES)) || command.match(makeMatcher(REGEX_SELF_ALIASES))) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    emitOthers(`${character.name} is admiring themselves.`);

    const job: string = firstUpper(character.job);
    const actorText: string[] = [];

    switch (character.job) {
      case ClassTypes.peacemaker:
        actorText.push(`You are ${character.name}, ${job}.  Your appear on the surface to be an ordinary human, though your muscles are toned to perfection.`);
        break;
      case ClassTypes.ranger:
        actorText.push(`You are ${character.name}, ${job}.  You are an ordinary human with extraordinary capabilities.`);
        break;
      case ClassTypes.rogue:
        actorText.push(`You are ${character.name}, ${job}.  You are an ordinary human, your skills and abilities extraordinarily well-balanced.`);
        break;
      case ClassTypes.skyguard:
        actorText.push(`You are ${character.name}, ${job}.  Patches of brightly colored fur bristle over your shoulders, forearms, and calves.  Your muscles are mighty and intimidating.`);
        break;
      case ClassTypes.spymaster:
        actorText.push(`You are ${character.name}, ${job}.  You appear to be an ordinary human, which is how you like it; your gifts are of the mind.`);
        break;
      case ClassTypes.weaver:
        actorText.push(`You are ${character.name}, ${job}.  Your skin shimmers with animated, iridescent patterns of color, betraying your magical nature.`);
        break;
    }

    // health
    actorText.push(characterHealthText(character));

    // equipment
    let naked: boolean = true;
    if (character.headgear) {
      actorText.push(`Upon your head, you wear ${items.get(character.headgear).title}.`);
      naked = false;
    }
    if (character.armor) {
      actorText.push(`On your body, you have donned ${items.get(character.armor).title}.`);
      naked = false;
    }
    if (character.gloves) {
      actorText.push(`Upon your hands: ${items.get(character.gloves).title}.`);
      naked = false;
    }
    if (character.legwear) {
      actorText.push(`Your legs are covered by ${items.get(character.legwear).title}.`);
      naked = false;
    }
    if (character.footwear) {
      actorText.push(`Your feet are protected by ${items.get(character.footwear).title}.`);
      naked = false;
    }
    if (character.weapon) {
      actorText.push(`In case of trouble, you carry ${items.get(character.weapon).title}.`);
    }
    if (character.offhand) {
      actorText.push(`You carry ${items.get(character.offhand).title} at the ready in your off-hand.`);
    }

    if (naked) actorText.push('You wear only a modest set of undergarments.');

    character.temporaryEffects.forEach(effect => {
      actorText.push(`You feel the effects of ${effect.name} coursing through your veins.`);
    });

    character.factionAnger.forEach(fa => {
      actorText.push(`${firstUpper(fa.faction)} remember how you've wronged them, and you may be attacked on sight.`);
    })

    actorText.push("Try [evaluate skills] to check on your skills and abilities.");

    emitSelf(actorText);

    return true;
  }

  // evaluate your skills
  if (command.match(makeMatcher(REGEX_EVAL_ALIASES))) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const actorText: string[] = [];

    // light weapons
    if (character.light_attack < 7) {
      actorText.push("You don't know the first thing about fighting with light weapons.");
    } else if (character.light_attack < 10) {
      actorText.push("You are better than the average person with light weapons, but not by much.");
    } else if (character.light_attack < 13) {
      actorText.push("You are competent at fighting with light weapons.");
    } else if (character.light_attack < 16) {
      actorText.push("You would beat most people in a contest of arms with light weapons.");
    } else if (character.light_attack < 20) {
      actorText.push("There are few who can match your skill with light weapons.");
    } else {
      actorText.push("Your skill with light weapons has become otherworldly.");
    }

    // heavy weapons
    if (character.heavy_attack < 7) {
      actorText.push("You can barely tell which end of a heavy weapon you're supposed to hold.");
    } else if (character.heavy_attack < 10) {
      actorText.push("You are familiar with the bare basics of fighting with heavy weapons.");
    } else if (character.heavy_attack < 13) {
      actorText.push("You can hold your own when fighting with heavy weapons.");
    } else if (character.heavy_attack < 16) {
      actorText.push("You would win most duels fought with heavy weapons.");
    } else if (character.heavy_attack < 20) {
      actorText.push("Not many could hope to match your skill with heavy weapons.");
    } else {
      actorText.push("Your skill with heavy weapons has become otherworldly.");
    }

    // ranged weapons
    if (character.ranged_attack < 7) {
      actorText.push("You might hurt yourself trying to use ranged weapons.");
    } else if (character.ranged_attack < 10) {
      actorText.push("You know enough about ranged weapons to point them away from yourself.");
    } else if (character.ranged_attack < 13) {
      actorText.push("You can hit what you are aiming for with ranged weapons, so long as the target doesn't move.");
    } else if (character.ranged_attack < 16) {
      actorText.push("You can reliably hit moving targets with ranged weapons.");
    } else if (character.ranged_attack < 20) {
      actorText.push("You are a crack shot with ranged weapons.");
    } else {
      actorText.push("Your skill with ranged weapons has become otherworldly.");
    }

    // agility
    if (character.agility < 7) {
      actorText.push("You are so inflexible and sluggish, you can barely get out of your own way.");
    } else if (character.agility < 10) {
      actorText.push("You have enough basic physical coordination to perform simple tasks.");
    } else if (character.agility < 13) {
      actorText.push("You have good control over your body.");
    } else if (character.agility < 16) {
      actorText.push("You move with precision and grace.");
    } else if (character.agility < 20) {
      actorText.push("You move with such effortless elegance that people stop to watch.");
    } else {
      actorText.push("Your agility has grown to be otherworldly.");
    }

    // strength
    if (character.strength < 7) {
      actorText.push("You are so weak that lifting a stack of books or walking up a flight of stairs is exhausting.");
    } else if (character.strength < 10) {
      actorText.push("You are strong enough to perform most daily tasks.");
    } else if (character.strength < 13) {
      actorText.push("Your muscles are rarely strained, even when training or performing manual labor.");
    } else if (character.strength < 16) {
      actorText.push("Your strength allows you to perform heavy manual labor without tiring.");
    } else if (character.strength < 20) {
      actorText.push("You are strong enough to perform feats that would leave most people in awe.");
    } else {
      actorText.push("Your strength has grown to be otherworldly.");
    }

    // savvy
    if (character.savvy < 7) {
      actorText.push("You aren't quite stupid, but you definitely miss a lot of what is going on around you.");
    } else if (character.savvy < 10) {
      actorText.push("You are smart enough to follow and participate in most conversations.");
    } else if (character.savvy < 13) {
      actorText.push("You are good with words and comprehend most situations.");
    } else if (character.savvy < 16) {
      actorText.push("You can tell when someone is being dishonest, and talk your way into a lot of things.");
    } else if (character.savvy < 20) {
      actorText.push("You are sharp enough to discern most folks' true intentions, and savvy enough to see your will done.");
    } else {
      actorText.push("Your savvy has grown to be otherworldly.");
    }

    actorText.push("Try [level] for guidance on using Lifelight energy to boost your skills and abilities.");

    emitSelf(actorText);

    return true;
  }

  // check level, xp, skills, abilities
  if (command.match(/^level$/)) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const actorText: string[] = [
      `The Lifelight has, so far, blessed you with ${xpAmountString(character.xp)} of its warmth.`,
      `You can use the energy bestowed by the Lifelight to empower your skills and abilities and grow stronger.`,
      `The stronger one of your skills or abilities already is, the more energy it will take to improve it.`,
      `To [level agility] will cost you ${levelRequirementString(character.agility)} of energy.`,
      `To [level strength] will cost you ${levelRequirementString(character.strength)} of energy.`,
      `To [level savvy] will cost you ${levelRequirementString(character.savvy)} of energy.`,
      `To [level light] weapon fighting will cost you ${levelRequirementString(character.light_attack)} of energy.`,
      `To [level heavy] weapon fighting will cost you ${levelRequirementString(character.heavy_attack)} of energy.`,
      `To [level ranged] weapon fighting will cost you ${levelRequirementString(character.ranged_attack)} of energy.`
    ];

    emitSelf(actorText);

    return true;
  }

  // level up skills and abilities
  const levelMatch: string | null = captureFrom(command, 'level');
  if (levelMatch !== null) {

    if (levelMatch === 'agility') {
      const cost: number = getCost(character.agility);
      if (character.xp >= cost) {
        if (writeCharacterData(handlerOptions, {
          agility: character.agility + 1,
          xp: character.xp - cost
        })) {
          emitOthers(`The Lifelight surges through ${name}!`);
          emitSelf(`You feel the Lifelight surging through you, and once it is done, you feel a little quicker than before.`);
          return true;
        }
      } else {
        emitOthers(`The Lifelight glimmers in ${name}, but fizzles as quickly as it appears.`);
        emitSelf(`You have not gathered enough of the Lifelight's warmth to become more agile.`);
        return true;
      }
    }

    if (levelMatch === 'strength') {
      const cost: number = getCost(character.strength);
      if (character.xp >= cost) {
        if (writeCharacterData(handlerOptions, {
          strength: character.strength + 1,
          xp: character.xp - cost
        })) {
          emitOthers(`The Lifelight surges through ${name}!`);
          emitSelf(`You feel the Lifelight surging through you, and once it is done, you feel a little stronger than before.`);
          return true;
        }
      } else {
        emitOthers(`The Lifelight glimmers in ${name}, but fizzles as quickly as it appears.`);
        emitSelf(`You have not gathered enough of the Lifelight's warmth to gain more strength.`);
        return true;
      }
    }

    if (levelMatch === 'savvy') {
      const cost: number = getCost(character.savvy);
      if (character.xp >= cost) {
        if (writeCharacterData(handlerOptions, {
          savvy: character.savvy + 1,
          xp: character.xp - cost
        })) {
          emitOthers(`The Lifelight surges through ${name}!`);
          emitSelf(`You feel the Lifelight surging through you, and once it is done, you feel your mind is a little sharper than before.`);
          return true;
        }
      } else {
        emitOthers(`The Lifelight glimmers in ${name}, but fizzles as quickly as it appears.`);
        emitSelf(`You have not gathered enough of the Lifelight's warmth to sharpen your intelligence and wisdom.`);
        return true;
      }
    }

    if (levelMatch === 'light') {
      const cost: number = getCost(character.light_attack);
      if (character.xp >= cost) {
        if (writeCharacterData(handlerOptions, {
          light_attack: character.light_attack + 1,
          xp: character.xp - cost
        })) {
          emitOthers(`The Lifelight surges through ${name}!`);
          emitSelf(`You feel the Lifelight surging through you, and once it is done, you feel a little better about using light weapons than before.`);
          return true;
        }
      } else {
        emitOthers(`The Lifelight glimmers in ${name}, but fizzles as quickly as it appears.`);
        emitSelf(`You have not gathered enough of the Lifelight's warmth to quicken your light weapon strikes.`);
        return true;
      }
    }

    if (levelMatch === 'heavy') {
      const cost: number = getCost(character.heavy_attack);
      if (character.xp >= cost) {
        if (writeCharacterData(handlerOptions, {
          heavy_attack: character.heavy_attack + 1,
          xp: character.xp - cost
        })) {
          emitOthers(`The Lifelight surges through ${name}!`);
          emitSelf(`You feel the Lifelight surging through you, and once it is done, you feel a little better about using heavy weapons than before.`);
          return true;
        }
      } else {
        emitOthers(`The Lifelight glimmers in ${name}, but fizzles as quickly as it appears.`);
        emitSelf(`You have not gathered enough of the Lifelight's warmth to strengthen your heavy weapon attacks.`);
        return true;
      }
    }

    if (levelMatch === 'ranged') {
      const cost: number = getCost(character.ranged_attack);
      if (character.xp >= cost) {
        if (writeCharacterData(handlerOptions, {
          ranged_attack: character.ranged_attack + 1,
          xp: character.xp - cost
        })) {
          emitOthers(`The Lifelight surges through ${name}!`);
          emitSelf(`You feel the Lifelight surging through you, and once it is done, you feel a little better about using ranged weapons than before.`);
          return true;
        }
      } else {
        emitOthers(`The Lifelight glimmers in ${name}, but fizzles as quickly as it appears.`);
        emitSelf(`You have not gathered enough of the Lifelight's warmth to improve your accuracy with ranged weapon strikes.`);
        return true;
      }
    }
  }

  // review your inventory
  if (command.match(makeMatcher(REGEX_INVENTORY_ALIASES))) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    emitOthers(`${character.name} is digging through their belongings.`);

    const actorText: string[] = [];

    if (character.inventory.length === 0) {
      actorText.push("You are not carrying any belongings.");
    } else {
      const itemDescriptions: InventoryDescriptionHelper[] = [];

      character.inventory.forEach(i => {
        const item: Item = items.get(i);
        const itemDesc: InventoryDescriptionHelper =
          itemDescriptions.find(desc => desc.id === item.id);
        if (!itemDesc) itemDescriptions.push({ id: item.id, desc: item.title, type: item.type, count: 1 });
        else itemDesc.count++;
      })

      actorText.push(...[
        "Among your belongings you find:",
        ...itemDescriptions.map(i => `${i.desc}${i.count > 1 ? ` {x${i.count}}` : ''} (${i.type})`),
        "(Try [inspect +item+] for a closer inspection.)"
      ])
    }

    actorText.push(getEncumbranceString(character));

    actorText.push(`You have ${character.money} coin${character.money === 1 ? '' : 's'} in your pouch.`);

    emitSelf(actorText);

    return true;
  }

  // drop an item from your inventory
  const dropMatch: string | null = captureFrom(command, REGEX_DROP_ALIASES);
  if (dropMatch !== null) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }

    const count: number = uniqueMatchCount(command, getInventoryAndWorn(character), REGEX_DROP_ALIASES);
    if (count < 1) return false;
    if (count > 1) {
      emitOthers(`${name} wants to drop something, but can't decide what.`);
      emitSelf(`You have multiple items that could be described as [${dropMatch}].  Be more specific so you don't drop the wrong thing.`);
      return true;
    }
  
    for (let i = 0; i < character.inventory.length; i++) {
      const item: Item = items.get(character.inventory[i]);
      if (matchMatchesKeywords(dropMatch, item.keywords)) {
        if (item.quest) {
          emitOthers(`${character.name} drops ${item.title}, but a magical force returns it to their hand!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        const newInventory: ItemIds[] = [...character.inventory];
        newInventory.splice(i, 1);
        if (writeCharacterData(handlerOptions, { inventory: newInventory })) {
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf([
            `You dropped ${item.title}.`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    };

    if (character.headgear) {
      const item: Item = items.get(character.headgear);
      if (matchMatchesKeywords(dropMatch, item.keywords)) {
        if (item.quest) {
          emitOthers(`${character.name} removes and drops ${item.title}, but a magical force returns it to their head!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        if (writeCharacterData(handlerOptions, { headgear: null })) {
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf([
            `You removed and dropped [${item.title}].`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    }

    if (character.armor) {
      const item: Item = items.get(character.armor);
      if (matchMatchesKeywords(dropMatch, item.keywords)) {
        if (item.quest) {
          emitOthers(`${character.name} removes and drops ${item.title}, but a magical force returns it to their head!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        if (writeCharacterData(handlerOptions, { armor: null })) {
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf([
            `You removed and dropped [${item.title}].`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    }

    if (character.gloves) {
      const item: Item = items.get(character.gloves);
      if (matchMatchesKeywords(dropMatch, item.keywords)) {
        if (item.quest) {
          emitOthers(`${character.name} removes and drops ${item.title}, but a magical force returns it to their head!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        if (writeCharacterData(handlerOptions, { gloves: null })) {
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf([
            `You removed and dropped [${item.title}].`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    }

    if (character.legwear) {
      const item: Item = items.get(character.legwear);
      if (matchMatchesKeywords(dropMatch, item.keywords)) {
        if (item.quest) {
          emitOthers(`${character.name} removes and drops ${item.title}, but a magical force returns it to their head!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        if (writeCharacterData(handlerOptions, { legwear: null })) {
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf([
            `You removed and dropped [${item.title}].`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    }

    if (character.footwear) {
      const item: Item = items.get(character.footwear);
      if (matchMatchesKeywords(dropMatch, item.keywords)) {
        if (item.quest) {
          emitOthers(`${character.name} removes and drops ${item.title}, but a magical force returns it to their head!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        if (writeCharacterData(handlerOptions, { footwear: null })) {
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf([
            `You removed and dropped [${item.title}].`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    }

    if (character.weapon) {
      const item: Item = items.get(character.weapon);
      if (matchMatchesKeywords(dropMatch, item.keywords)) {
        if (item.quest) {
          emitOthers(`${character.name} removes and drops ${item.title}, but a magical force returns it to their head!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        if (writeCharacterData(handlerOptions, { weapon: null })) {
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf([
            `You removed and dropped [${item.title}].`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    }

    if (character.offhand) {
      const item: Item = items.get(character.offhand);
      if (matchMatchesKeywords(dropMatch, item.keywords)) {
        if (item.quest) {
          emitOthers(`${character.name} removes and drops ${item.title}, but a magical force returns it to their head!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        if (writeCharacterData(handlerOptions, { offhand: null })) {
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf([
            `You removed and dropped [${item.title}].`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    }

    emitSelf(`You do not have any [${dropMatch}] to drop.`);

    return true;
  }

  // pick up an item in your current scene
  const getMatch: string | null = captureFrom(command, REGEX_GET_ALIASES);
  if (getMatch !== null) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const sceneInventory: string[] = scenes.get(character.scene_id).publicInventory;

    const count: number = uniqueMatchCount(command, sceneInventory.map(i => items.get(i)), REGEX_GET_ALIASES);
    if (count > 1) {
      emitOthers(`${name} looks around, trying to decide what item to pick up.`);
      emitSelf(`There are multiple items here that could be described as [${getMatch}].  Be more specific so you don't drop pick up the wrong thing.`);
      return true;
    }

    for (let i = 0; i < sceneInventory.length; i++) {
      const item: Item = items.get(sceneInventory[i]);
      if (matchMatchesKeywords(getMatch, item.keywords)) {
        const newInventory: ItemIds[] = [...character.inventory, item.id];
        if (writeCharacterData(handlerOptions, { inventory: newInventory })) {
          sceneInventory.splice(i, 1);
          emitSelf([
            `You picked up ${item.title}.`,
            getEncumbranceString(character)
          ]);
          emitOthers(`${character.name} picked up ${item.title}.`);
          return true;
        }
      }
    };
  }

  // handle looking at an item in your inventory
  const lookMatch: string | null = captureFrom(command, REGEX_LOOK_ALIASES);
  if (lookMatch !== null) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const count: number = uniqueMatchCount(command, getInventoryAndWorn(character), REGEX_LOOK_ALIASES);
    if (count > 1) {
      emitOthers(`${name} rifles through their stuff, looking a little bewildered.`);
      emitSelf(`There are multiple items among your effects that could be described as [${lookMatch}].  Be more specific so you don't inspect the wrong thing.`);
      return true;
    }

    for (let i = 0; i < character.inventory.length; i++) {
      const item: Item = items.get(character.inventory[i]);
      if (item.keywords.includes(lookMatch)) {
        const itemDescription: string = item.description;
        const itemTitle: string = item.title;
        emitSelf(['In your inventory:', itemDescription]);
        emitOthers(`${character.name} is closely inspecting ${itemTitle}.`);
        return true;
      }
    }

    const headgear: Item = items.get(character.headgear);
    if (headgear?.keywords.includes(lookMatch)) {
      emitSelf(['Worn on your head:', headgear.description]);
      emitOthers(`${character.name} is closely inspecting ${headgear.title}.`);
      return true;
    }

    const armor: Item = items.get(character.armor);
    if (armor?.keywords.includes(lookMatch)) {
      emitSelf(['Worn on your body:', armor.description]);
      emitOthers(`${character.name} is closely inspecting ${armor.title}.`);
      return true;
    }
    const gloves: Item = items.get(character.gloves);
    if (gloves?.keywords.includes(lookMatch)) {
      emitSelf(['Worn on your hands:', gloves.description]);
      emitOthers(`${character.name} is closely inspecting ${gloves.title}.`);
      return true;
    }
    const legwear: Item = items.get(character.legwear);
    if (legwear?.keywords.includes(lookMatch)) {
      emitSelf(['Worn on your legs:', legwear.description]);
      emitOthers(`${character.name} is closely inspecting ${legwear.title}.`);
      return true;
    }
    const footwear: Item = items.get(character.footwear);
    if (footwear?.keywords.includes(lookMatch)) {
      emitSelf(['Worn on your feet:', footwear.description]);
      emitOthers(`${character.name} is closely inspecting ${footwear.title}.`);
      return true;
    }
    const weapon: Item = items.get(character.weapon);
    if (weapon?.keywords.includes(lookMatch)) {
      emitSelf(['Carried as a weapon:', weapon.description]);
      emitOthers(`${character.name} is closely inspecting ${weapon.title}.`);
      return true;
    }
    const offhand: Item = items.get(character.offhand);
    if (offhand?.keywords.includes(lookMatch)) {
      emitSelf(['Carried in your off-hand:', offhand.description]);
      emitOthers(`${character.name} is closely inspecting ${offhand.title}.`);
      return true;
    }
  }

  // equip an item from your inventory
  const equipMatch: string | null = captureFrom(command, REGEX_EQUIP_ALIASES);
  if (equipMatch !== null) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const count: number = uniqueMatchCount(command, character.inventory.map(i => items.get(i)), REGEX_EQUIP_ALIASES);
    if (count > 1) {
      emitOthers(`${name} shuffles through their stuff.`);
      emitSelf(`You are carrying multiple items that could be described as [${equipMatch}].  Be more specific so you don't equip the wrong thing.`);
      return true;
    }

    for (let i = 0; i < character.inventory.length; i++) {
      const item: Item = items.get(character.inventory[i]);
      // If this is the item the user is trying to equip
      if (item.keywords.includes(equipMatch)) {
        
        if (item.type === ItemTypes.saddlebags) {
          if (character.horse === null || !scenes.get(character.scene_id).horseAllowed) {
            emitOthers(`${name} holds up a set of saddlebags, pretending to put them on an imaginary horse.`);
            emitSelf(`You don't have a horse to put ${item.title} on.`);
            return true;
          }

          // make sure new saddlebags can carry what is already in horse's inventory
          const maxCarry: number = saddlebagCapacityMap.get(item.id);
          const carried: number = character.horse.inventory.reduce((acc, cur) => acc + items.get(cur).weight, 0);
          if (carried > maxCarry) {
            emitOthers(`${character.name} tried to move ${character.horse.name}'s items to smaller saddlebags, but they wouldn't fit.`);
            emitSelf(`You try to put ${character.horse.name}'s inventory into smaller saddlebags, but they don't fit.`);
            return true;
          }

          const newHorse: Horse = {
            ...character.horse,
            saddlebagsId: item.id
          };
          const newInventory: ItemIds[] = [ ...character.inventory, character.horse.saddlebagsId ];
          let removedItemTitle: string = items.get(character.horse.saddlebagsId).title;

          newInventory.splice(i, 1);
          newHorse.saddlebagsId = item.id;

          if (writeCharacterData(handlerOptions, {
            horse: newHorse,
            inventory: newInventory
          })) {
            emitOthers(`${character.name} removes ${removedItemTitle} and puts ${item.title} on their horse.`);
            emitSelf(`You remove ${removedItemTitle} and put ${item.title} on ${newHorse.name}.`);
            return true;
          }
        }
        
        if (item.type === ItemTypes.headgear) {
          const newInventory: ItemIds[] = [ ...character.inventory ];
          let removedItemTitle: string | undefined;
          if (character.headgear) {
            newInventory.push(character.headgear);
            removedItemTitle = items.get(character.headgear).title;
          }
          newInventory.splice(i, 1);
          if (writeCharacterData(handlerOptions, {
            headgear: item.id,
            inventory: newInventory
          })) {
            emitOthers(`${character.name}${removedItemTitle ? ` removes ${removedItemTitle} and` : ''} wears ${item.title} on their head.`);
            emitSelf(`You${removedItemTitle ? ` remove ${removedItemTitle} and` : ''} wear ${item.title} on your head.`);
            return true;
          }
        }
        
        else if (item.type === ItemTypes.armor) {
          const newInventory: ItemIds[] = [ ...character.inventory ];
          let removedItemTitle: string | undefined;
          if (character.armor) {
            newInventory.push(character.armor);
            removedItemTitle = items.get(character.armor).title;
          }
          newInventory.splice(i, 1);
          if (writeCharacterData(handlerOptions, {
            armor: item.id,
            inventory: newInventory
          })) {
            emitOthers(`${character.name}${removedItemTitle ? ` removes ${removedItemTitle} and` : ''} dons ${item.title} upon their person.`);
            emitSelf(`You${removedItemTitle ? ` remove ${removedItemTitle} and` : ''} wear ${item.title} on your body.`);
            return true;
          }
        }
        
        else if (item.type === ItemTypes.gloves) {
          const newInventory: ItemIds[] = [ ...character.inventory ];
          let removedItemTitle: string | undefined;
          if (character.gloves)  {
            newInventory.push(character.gloves);
            removedItemTitle = items.get(character.gloves).title;
          }
          newInventory.splice(i, 1);
          if (writeCharacterData(handlerOptions, {
            gloves: item.id,
            inventory: newInventory
          })) {
            emitOthers(`${character.name}${removedItemTitle ? ` removes ${removedItemTitle} and` : ''} slips ${item.title} onto their hands.`);
            emitSelf(`You${removedItemTitle ? ` remove ${removedItemTitle} and` : ''} slip on ${item.title}.`);
            return true;
          }
        }
        
        else if (item.type === ItemTypes.legwear) {
          const newInventory: ItemIds[] = [ ...character.inventory ];
          let removedItemTitle: string | undefined;
          if (character.legwear)  {
            newInventory.push(character.legwear);
            removedItemTitle = items.get(character.legwear).title;
          }
          newInventory.splice(i, 1);
          if (writeCharacterData(handlerOptions, {
            legwear: item.id,
            inventory: newInventory
          })) {
            emitOthers(`${character.name}${removedItemTitle ? ` removes ${removedItemTitle} and` : ''} slips into ${item.title}.`);
            emitSelf(`You${removedItemTitle ? ` remove ${removedItemTitle} and` : ''} put on ${item.title}.`);
            return true;
          }
        }
        
        else if (item.type === ItemTypes.footwear) {
          const newInventory: ItemIds[] = [ ...character.inventory ];
          let removedItemTitle: string | undefined;
          if (character.footwear)  {
            newInventory.push(character.footwear);
            removedItemTitle = items.get(character.footwear).title;
          }
          newInventory.splice(i, 1);
          if (writeCharacterData(handlerOptions, {
            footwear: item.id,
            inventory: newInventory
          })) {
            emitOthers(`${character.name}${removedItemTitle ? ` removes ${removedItemTitle} and` : ''} puts ${item.title} on their feet.`);
            emitSelf(`You${removedItemTitle ? ` remove ${removedItemTitle} and` : ''} slip your feet into ${item.title}.`);
            return true;
          }
        }

        else if ([ItemTypes.lightWeapon, ItemTypes.heavyWeapon, ItemTypes.rangedWeapon].includes(item.type)) {
          const newInventory: ItemIds[] = [ ...character.inventory ];
          let removedItemTitle: string | undefined;
          if (character.weapon)  {
            newInventory.push(character.weapon);
            removedItemTitle = items.get(character.weapon).title;
          }
          newInventory.splice(i, 1);
          if (writeCharacterData(handlerOptions, {
            weapon: item.id,
            inventory: newInventory
          })) {
            emitOthers(`${character.name}${removedItemTitle ? ` puts away ${removedItemTitle} and` : ''} wields ${item.title}.`);
            emitSelf(`You${removedItemTitle ? ` put away ${removedItemTitle} and` : ''} ready ${item.title} for combat.`);
            return true;
          }
        }

        else if ([ ItemTypes.offhand, ItemTypes.trinket ].includes(item.type)) {
          const newInventory: ItemIds[] = [ ...character.inventory ];
          let removedItemTitle: string | undefined;
          if (character.offhand)  {
            newInventory.push(character.offhand);
            removedItemTitle = items.get(character.offhand).title;
          }
          newInventory.splice(i, 1);
          if (writeCharacterData(handlerOptions, {
            offhand: item.id,
            inventory: newInventory
          })) {
            emitOthers(`${character.name}${removedItemTitle ? ` puts away ${removedItemTitle} and` : ''} equips ${item.title} in their hand.`);
            emitSelf(`You${removedItemTitle ? ` put away ${removedItemTitle} and` : ''} equip ${item.title}.`);
            return true;
          }
        }
      }
    };
  }

  // remove an item and put it into your inventory
  const unequipMatch: string | null = captureFrom(command, REGEX_UNEQUIP_ALIASES);
  if (unequipMatch !== null) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }

    const count: number = uniqueMatchCount(command, getWornItems(character), REGEX_UNEQUIP_ALIASES);
    if (count > 1) {
      emitOthers(`${name} looks around, trying to decide what item to pick up.`);
      emitSelf(`You are wearing multiple items that could be described as [${unequipMatch}].  Be more specific so you don't drop pick up the wrong thing.`);
      return true;
    }

    if (character.headgear && items.get(character.headgear).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.headgear);
      const newInventory: ItemIds[] = [ ...character.inventory, character.headgear ];
      if (writeCharacterData(handlerOptions, {
        headgear: null,
        inventory: newInventory
      })) {
        emitOthers(`${character.name} removes ${item.title} from their head.`);
        emitSelf(`You remove ${item.title} from your head.`);
        return true;
      }
    }

    else if (character.armor && items.get(character.armor).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.armor);
      const newInventory: ItemIds[] = [ ...character.inventory, character.armor ];
      if (writeCharacterData(handlerOptions, {
        armor: null,
        inventory: newInventory
      })) {
        emitOthers(`${character.name} removes ${item.title}.`);
        emitSelf(`You remove ${item.title}.`);
        return true;
      }
    }

    else if (character.gloves && items.get(character.gloves).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.gloves);
      const newInventory: ItemIds[] = [ ...character.inventory, character.gloves ];
      if (writeCharacterData(handlerOptions, {
        gloves: null,
        inventory: newInventory
      })) {
        emitOthers(`${character.name} pulls ${item.title} off of their hands.`);
        emitSelf(`You remove ${item.title} from your hands.`);
        return true;
      }
    }

    else if (character.legwear && items.get(character.legwear).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.legwear);
      const newInventory: ItemIds[] = [ ...character.inventory, character.legwear ];
      if (writeCharacterData(handlerOptions, {
        legwear: null,
        inventory: newInventory
      })) {
        emitOthers(`${character.name} slips out of ${item.title}.`);
        emitSelf(`You pull ${item.title} off of your legs.`);
        return true;
      }
    }

    else if (character.footwear && items.get(character.footwear).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.footwear);
      const newInventory: ItemIds[] = [ ...character.inventory, character.footwear ];
      if (writeCharacterData(handlerOptions, {
        footwear: null,
        inventory: newInventory
      })) {
        emitOthers(`${character.name} wrestles ${item.title} off of their feet.`);
        emitSelf(`You pry ${item.title} off of your feet.`);
        return true;
      }
    }

    else if (character.weapon && items.get(character.weapon).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.weapon);
      const newInventory: ItemIds[] = [ ...character.inventory, character.weapon ];
      if (writeCharacterData(handlerOptions, {
        weapon: null,
        inventory: newInventory
      })) {
        emitOthers(`${character.name} puts ${item.title} away.`);
        emitSelf(`You put away ${item.title}.`);
        return true;
      }
    }

    else if (character.offhand && items.get(character.offhand).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.offhand);
      const newInventory: ItemIds[] = [ ...character.inventory, character.offhand ];
      if (writeCharacterData(handlerOptions, {
        offhand: null,
        inventory: newInventory
      })) {
        emitOthers(`${character.name} puts away ${item.title}.`);
        emitSelf(`You put ${item.title} away.`);
        return true;
      }
    }

    else {
      emitSelf(`You are not wearing or wielding any ${unequipMatch}.`);
      return true;
    }
  }

  return false;
}

export default handleCharacterCommand;
