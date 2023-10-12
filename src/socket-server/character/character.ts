import { HandlerOptions } from '../server';
import { characterHealthText } from '../../utils/characterHealthText';
import { getEmitters } from '../../utils/emitHelper';
import { firstCharToUpper } from '../../utils/firstCharToUpper';
import { Item, ItemTypes, items } from '../items/items';
import { scenes } from '../scenes/scenes';
import { writeCharacterData, writeCharacterInventory } from '../../../sqlite/sqlite';
import { ClassTypes, InventoryDescriptionHelper, XpAmounts } from '../../types';
import { levelRequirementString, xpAmountString } from '../../utils/levelingStrings';
import { captureFrom, makeMatcher } from '../../utils/makeMatcher';
import { REGEX_DROP_ALIASES, REGEX_EQUIP_ALIASES, REGEX_EVAL_ALIASES, REGEX_GET_ALIASES, REGEX_INVENTORY_ALIASES, REGEX_LOOK_ALIASES, REGEX_SELF_ALIASES, REGEX_UNEQUIP_ALIASES } from '../../constants';

export function handleCharacterCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitSelf, emitOthers } = getEmitters(socket, character.scene_id);

  if (!character.job) {
    emitSelf("You must finish creating your new character first.");
    return true;
  }

  // look at yourself
  if (command.match(makeMatcher(REGEX_LOOK_ALIASES, REGEX_SELF_ALIASES))) {
    emitOthers(`${character.name} is admiring themselves.`);

    const job: string = firstCharToUpper(character.job);
    const actorText: string[] = [];

    switch (character.job) {
      case ClassTypes.peacemaker:
        actorText.push(`You are ${character.name}, ${job}.  Your skin is ashen gray, your hair inky black.  Your muscles are toned to perfection.`);
        break;
      case ClassTypes.ranger:
        actorText.push(`You are ${character.name}, ${job}.  You are an ordinary human.`);
        break;
      case ClassTypes.rogue:
        actorText.push(`You are ${character.name}, ${job}.  You are an ordinary human.`);
        break;
      case ClassTypes.skyguard:
        actorText.push(`You are ${character.name}, ${job}.  Patches of brightly colored fur bristle over your shoulders, forearms, and calves.  Your muscles are mighty and intimidating.`);
        break;
      case ClassTypes.spymaster:
        actorText.push(`You are ${character.name}, ${job}.  You are an ordinary human`);
        break;
      case ClassTypes.weaver:
        actorText.push(`You are ${character.name}, ${job}.  Your skin shimmers with animated, iridescent patterns of color.`);
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
      actorText.push(`Covering your hands: ${items.get(character.gloves).title}.`);
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

    // encumbrance
    let carried: number =
      character.inventory.reduce( (runningTotal, itemId) => runningTotal + items.get(itemId).weight, 0 );
    if (character.headgear) carried += items.get(character.headgear).weight;
    if (character.armor) carried += items.get(character.armor).weight;
    if (character.gloves) carried += items.get(character.gloves).weight;
    if (character.legwear) carried += items.get(character.legwear).weight;
    if (character.footwear) carried += items.get(character.footwear).weight;
    if (character.weapon) carried += items.get(character.weapon).weight;
    if (character.offhand) carried += items.get(character.offhand).weight;
    const maxCarry: number = character.strength * 10;
    if (carried < maxCarry * 0.25) {
      actorText.push("You barely notice the weight of the things you are carrying.");
    } else if (carried < maxCarry * 0.5) {
      actorText.push("You are carrying enough that you notice the weight.");
    } else if (carried < maxCarry * 0.75) {
      actorText.push("You sweat a little under the load of all you're carrying.");
    } else if (carried <= maxCarry) {
      actorText.push("You can barely carry all the things you've accumulated.");
    } else {
      actorText.push("You are carrying so much that you can't take another step.");
    }

    actorText.push("Try [evaluate skills] to check on your skills and abilities.");

    emitSelf(actorText);

    return true;
  }

  // evaluate your skills
  if (command.match(makeMatcher(REGEX_EVAL_ALIASES))) {
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
    const actorText: string[] = [
      `The Lifelight has, so far, blessed you with ${xpAmountString(character.xp)} of its warmth.`,
      `You can use the energy bestowed by the Lifelight to empower your skills and abilities and grow stronger.`,
      `The stronger one of your skills or abilities already is, the more energy it will take to improve it.`,
      `To [level agility] will cost you ${levelRequirementString(character.agility)} of energy.`,
      `To [level strength] will cost you ${levelRequirementString(character.strength)} of energy.`,
      `To [level savvy] will cost you ${levelRequirementString(character.savvy)} of energy.`,
      `To [level light weapon fighting] will cost you ${levelRequirementString(character.light_attack)} of energy.`,
      `To [level heavy weapon fighting] will cost you ${levelRequirementString(character.heavy_attack)} of energy.`,
      `To [level ranged weapon fighting] will cost you ${levelRequirementString(character.ranged_attack)} of energy.`
    ];

    emitSelf(actorText);

    return true;
  }

  // look at your stuff
  if (command.match(makeMatcher(REGEX_INVENTORY_ALIASES))) {
    emitOthers(`${character.name} is digging through their belongings.`);

    const actorText: string[] = [`You have ${character.money} coin${character.money === 1 ? '' : 's'} in your pouch.`];

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
        "(Try [inspect (item)] for a closer inspection.)"
      ])
    }
    emitSelf(actorText);

    return true;
  }

  // drop an item from your inventory
  const dropMatch: string | null = captureFrom(command, REGEX_DROP_ALIASES);
  if (dropMatch !== null) {
    for (let i = 0; i < character.inventory.length; i++) {
      const item: Item = items.get(character.inventory[i]);
      if (item.keywords.includes(dropMatch)) {
        if (item.quest) {
          emitOthers(`${character.name} drops ${item.title}, but a magical force returns it to their hand!`);
          emitSelf(`You can't leave ${item.title} behind, you'll need it later.`);
          return true;
        }
        const newInventory: string[] = [...character.inventory];
        newInventory.splice(i, 1);
        if (writeCharacterInventory(character.id, newInventory)) {
          character.inventory = newInventory;
          scenes.get(character.scene_id).publicInventory.push(item.id);
          emitSelf(`You dropped ${item.title}.`);
          emitOthers(`${character.name} dropped ${item.title}.`);
          return true;
        }
      }
    };
    emitSelf(`You do not have any [${dropMatch}] to drop.`);

    return true;
  }

  // pick up an item in your current scene
  const getMatch: string | null = captureFrom(command, REGEX_GET_ALIASES);
  if (getMatch !== null) {
    const sceneInventory: string[] = scenes.get(character.scene_id).publicInventory;

    for (let i = 0; i < sceneInventory.length; i++) {
      if (items.get(sceneInventory[i]).keywords.includes(getMatch)) {
        const itemId: string = items.get(sceneInventory[i]).id;
        const itemTitle: string = items.get(sceneInventory[i]).title;
        const newInventory: string[] = [...character.inventory, itemId];
        if (writeCharacterInventory(character.id, newInventory)) {
          character.inventory = newInventory;
          sceneInventory.splice(i, 1);
          emitSelf(`You picked up ${itemTitle}.`);
          emitOthers(`${character.name} picked up ${itemTitle}.`);
          return true;
        }
      }
    };
  }

  // handle looking at an item in your inventory
  const lookMatch: string | null = captureFrom(command, REGEX_LOOK_ALIASES);
  if (lookMatch !== null) {
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
    for (let i = 0; i < character.inventory.length; i++) {
      const item: Item = items.get(character.inventory[i]);
      // If this is the item the user is trying to equip
      if (item.keywords.includes(equipMatch)) {
        
        if (item.type === ItemTypes.headgear) {
          const newInventory: string[] = [ ...character.inventory ];
          if (character.headgear) newInventory.push(character.headgear);
          newInventory.splice(i, 1);
          if (writeCharacterData(character.id, {
            headgear: item.id,
            inventory: newInventory
          })) {
            character.headgear = item.id;
            character.inventory = newInventory;
            emitOthers(`${character.name} wears ${item.title} on their head.`);
            emitSelf(`You wear ${item.title} on your head.`);
            return true;
          }
        }
        
        else if (item.type === ItemTypes.armor) {
          const newInventory: string[] = [ ...character.inventory ];
          if (character.armor) newInventory.push(character.armor);
          newInventory.splice(i, 1);
          if (writeCharacterData(character.id, {
            armor: item.id,
            inventory: newInventory
          })) {
            character.armor = item.id;
            character.inventory = newInventory;
            emitOthers(`${character.name} dons ${item.title} upon their person.`);
            emitSelf(`You wear ${item.title} on your body.`);
            return true;
          }
        }
        
        else if (item.type === ItemTypes.gloves) {
          const newInventory: string[] = [ ...character.inventory ];
          if (character.gloves) newInventory.push(character.gloves);
          newInventory.splice(i, 1);
          if (writeCharacterData(character.id, {
            gloves: item.id,
            inventory: newInventory
          })) {
            character.gloves = item.id;
            character.inventory = newInventory;
            emitOthers(`${character.name} slips ${item.title} onto their hands.`);
            emitSelf(`You slip your hands into ${item.title}.`);
            return true;
          }
        }
        
        else if (item.type === ItemTypes.legwear) {
          const newInventory: string[] = [ ...character.inventory ];
          if (character.legwear) newInventory.push(character.legwear);
          newInventory.splice(i, 1);
          if (writeCharacterData(character.id, {
            legwear: item.id,
            inventory: newInventory
          })) {
            character.legwear = item.id;
            character.inventory = newInventory;
            emitOthers(`${character.name} slips into ${item.title}.`);
            emitSelf(`You put on ${item.title}.`);
            return true;
          }
        }
        
        else if (item.type === ItemTypes.footwear) {
          const newInventory: string[] = [ ...character.inventory ];
          if (character.footwear) newInventory.push(character.footwear);
          newInventory.splice(i, 1);
          if (writeCharacterData(character.id, {
            footwear: item.id,
            inventory: newInventory
          })) {
            character.footwear = item.id;
            character.inventory = newInventory;
            emitOthers(`${character.name} puts ${item.title} on their feet.`);
            emitSelf(`You slip your feet into ${item.title}.`);
            return true;
          }
        }

        else if ([ItemTypes.lightWeapon, ItemTypes.heavyWeapon, ItemTypes.rangedWeapon].includes(item.type)) {
          const newInventory: string[] = [ ...character.inventory ];
          if (character.weapon) newInventory.push(character.weapon);
          newInventory.splice(i, 1);
          if (writeCharacterData(character.id, {
            weapon: item.id,
            inventory: newInventory
          })) {
            character.weapon = item.id;
            character.inventory = newInventory;
            emitOthers(`${character.name} wields ${item.title}.`);
            emitSelf(`You ready ${item.title} for combat.`);
            return true;
          }
        }

        else if ([ ItemTypes.offhand, ItemTypes.trinket ].includes(item.type)) {
          const newInventory: string[] = [ ...character.inventory ];
          if (character.offhand) newInventory.push(character.offhand);
          newInventory.splice(i, 1);
          if (writeCharacterData(character.id, {
            offhand: item.id,
            inventory: newInventory
          })) {
            character.offhand = item.id;
            character.inventory = newInventory;
            emitOthers(`${character.name} holds ${item.title} in their hand.`);
            emitSelf(`You hold onto ${item.title}.`);
            return true;
          }
        }

        else {
          emitOthers(`${character.name} tries to wear ${item.title}.  It doesn't work.`);
          emitSelf(`${firstCharToUpper(item.title)} cannot be equipped like that.`);
          return true;
        }
      }
    };
  }

  // remove an item and put it into your inventory
  const unequipMatch: string | null = captureFrom(command, REGEX_UNEQUIP_ALIASES);
  if (unequipMatch !== null) {
    if (character.headgear && items.get(character.headgear).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.headgear);
      const newInventory: string[] = [ ...character.inventory, character.headgear ];
      if (writeCharacterData(character.id, {
        headgear: null,
        inventory: newInventory
      })) {
        character.headgear = null;
        character.inventory = newInventory;
        emitOthers(`${character.name} removes ${item.title} from their head.`);
        emitSelf(`You remove ${item.title} from your head.`);
        return true;
      }
    }

    else if (character.armor && items.get(character.armor).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.armor);
      const newInventory: string[] = [ ...character.inventory, character.armor ];
      if (writeCharacterData(character.id, {
        armor: null,
        inventory: newInventory
      })) {
        character.armor = null;
        character.inventory = newInventory;
        emitOthers(`${character.name} removes ${item.title}.`);
        emitSelf(`You remove ${item.title}.`);
        return true;
      }
    }

    else if (character.gloves && items.get(character.gloves).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.gloves);
      const newInventory: string[] = [ ...character.inventory, character.gloves ];
      if (writeCharacterData(character.id, {
        gloves: null,
        inventory: newInventory
      })) {
        character.gloves = null;
        character.inventory = newInventory;
        emitOthers(`${character.name} pulls ${item.title} off of their hands.`);
        emitSelf(`You remove ${item.title} from your hands.`);
        return true;
      }
    }

    else if (character.legwear && items.get(character.legwear).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.legwear);
      const newInventory: string[] = [ ...character.inventory, character.legwear ];
      if (writeCharacterData(character.id, {
        legwear: null,
        inventory: newInventory
      })) {
        character.legwear = null;
        character.inventory = newInventory;
        emitOthers(`${character.name} slips out of ${item.title}.`);
        emitSelf(`You pull ${item.title} off of your legs.`);
        return true;
      }
    }

    else if (character.footwear && items.get(character.footwear).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.footwear);
      const newInventory: string[] = [ ...character.inventory, character.footwear ];
      if (writeCharacterData(character.id, {
        footwear: null,
        inventory: newInventory
      })) {
        character.footwear = null;
        character.inventory = newInventory;
        emitOthers(`${character.name} wrestles ${item.title} off of their feet.`);
        emitSelf(`You pry ${item.title} off of your feet.`);
        return true;
      }
    }

    else if (character.weapon && items.get(character.weapon).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.weapon);
      const newInventory: string[] = [ ...character.inventory, character.weapon ];
      if (writeCharacterData(character.id, {
        weapon: null,
        inventory: newInventory
      })) {
        character.weapon = null;
        character.inventory = newInventory;
        emitOthers(`${character.name} puts ${item.title} away.`);
        emitSelf(`You put away ${item.title}.`);
        return true;
      }
    }

    else if (character.offhand && items.get(character.offhand).keywords.includes(unequipMatch)) {
      const item: Item = items.get(character.offhand);
      const newInventory: string[] = [ ...character.inventory, character.offhand ];
      if (writeCharacterData(character.id, {
        offhand: null,
        inventory: newInventory
      })) {
        character.offhand = null;
        character.inventory = newInventory;
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
