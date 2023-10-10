import { HandlerOptions } from '../server';
import { getEmitters } from '../../utils/emitHelper';
import { Item, ItemTypes, items } from '../items/items';
import { scenes } from '../scenes/scenes';
import { writeCharacterData, writeCharacterInventory } from '../../../sqlite/sqlite';
import { InventoryDescriptionHelper } from '../../types';

export function handleCharacterCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitSelf, emitOthers } = getEmitters(socket, character.scene_id);

  // look at yourself
  if (command.match(/^(?:self|look self)$/)) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    emitOthers(`${character.name} is admiring themselves.`);

    const job: string = [character.job.charAt(0).toUpperCase(), character.job.substring(1)].join('');
    const actorText: string[] = [`You are ${character.name}, ${job}.`];

    // health
    if (character.health < character.health_max * 0.25) {
      actorText.push("You feel as though you are on the edge of death.");
    } else if (character.health < character.health_max * 0.5) {
      actorText.push("You are seriously injured and in significant pain.");
    } else if (character.health < character.health_max * 0.75) {
      actorText.push("You notice some aches and pains in your body.");
    } else {
      actorText.push("You feel well and are in good health.");
    }

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

    emitSelf(actorText);

    return true;
  }

  // look at your stuff
  if (['look inventory', 'peek inventory', 'inventory', 'inv'].includes(command)) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
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
  if (command.match(/^drop /)) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const dropPattern = /^drop (.*)$/;
    const match = command.match(dropPattern);
    
    if (!match) return false;

    if (match.length > 1) {
      const userInput: string = match[1];
      for (let i = 0; i < character.inventory.length; i++) {
        const item: Item = items.get(character.inventory[i]);
        if (item.keywords.includes(userInput)) {
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
      emitSelf(`You do not have any [${userInput}] to drop.`);
    }

    return true;
  }

  // pick up an item in your current scene
  if (command.match(/^(?:get|grab|pick up|take) /)) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const getPattern = /^(?:get|grab|pick up|take) (.*)$/;
    const match = command.match(getPattern);
    
    if (!match) return false;

    if (match.length > 1) {
      const userInput: string = match[1];
      const sceneInventory: string[] = scenes.get(character.scene_id).publicInventory;

      for (let i = 0; i < sceneInventory.length; i++) {
        if (items.get(sceneInventory[i]).keywords.includes(userInput)) {
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
    return false
  }

  // look at an item in your inventory
  if (command.match(/^(?:look inventory|look inv|inspect) /)) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const lookPattern = /^(?:look inventory|look inv|inspect) (.*)$/;
    const match = command.match(lookPattern);
    
    if (!match) return false;

    if (match.length > 1) {
      const userInput: string = match[1];
      for (let i = 0; i < character.inventory.length; i++) {
        const item: Item = items.get(character.inventory[i]);
        if (item.keywords.includes(userInput)) {
          const itemDescription: string = item.description;
          const itemTitle: string = item.title;
          emitSelf(['In your inventory:', itemDescription]);
          emitOthers(`${character.name} is closely inspecting ${itemTitle}.`);
          return true;
        }
      }

      const headgear: Item = items.get(character.headgear);
      if (headgear?.keywords.includes(userInput)) {
        emitSelf(['In your inventory:', headgear.description]);
        emitOthers(`${character.name} is closely inspecting ${headgear.title}.`);
        return true;
      }

      const armor: Item = items.get(character.armor);
      if (armor?.keywords.includes(userInput)) {
        emitSelf(['In your inventory:', armor.description]);
        emitOthers(`${character.name} is closely inspecting ${armor.title}.`);
        return true;
      }
      const gloves: Item = items.get(character.gloves);
      if (gloves?.keywords.includes(userInput)) {
        emitSelf(['In your inventory:', gloves.description]);
        emitOthers(`${character.name} is closely inspecting ${gloves.title}.`);
        return true;
      }
      const legwear: Item = items.get(character.legwear);
      if (legwear?.keywords.includes(userInput)) {
        emitSelf(['In your inventory:', legwear.description]);
        emitOthers(`${character.name} is closely inspecting ${legwear.title}.`);
        return true;
      }
      const footwear: Item = items.get(character.footwear);
      if (footwear?.keywords.includes(userInput)) {
        emitSelf(['In your inventory:', footwear.description]);
        emitOthers(`${character.name} is closely inspecting ${footwear.title}.`);
        return true;
      }
      const weapon: Item = items.get(character.weapon);
      if (weapon?.keywords.includes(userInput)) {
        emitSelf(['In your inventory:', weapon.description]);
        emitOthers(`${character.name} is closely inspecting ${weapon.title}.`);
        return true;
      }
      const offhand: Item = items.get(character.offhand);
      if (offhand?.keywords.includes(userInput)) {
        emitSelf(['In your inventory:', offhand.description]);
        emitOthers(`${character.name} is closely inspecting ${offhand.title}.`);
        return true;
      }
    }
  }

  // equip an item from your inventory
  if (command.match(/^(?:equip|wear) (.*)$/)) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const equipPattern = /^(?:equip|wear|use) (.*)$/;
    const match = command.match(equipPattern);
    
    if (!match) return false;

    if (match.length > 1) {
      const userInput: string = match[1];
      for (let i = 0; i < character.inventory.length; i++) {
        const item: Item = items.get(character.inventory[i]);
        // If this is the item the user is trying to equip
        if (item.keywords.includes(userInput)) {
          
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
          
          if (item.type === ItemTypes.armor) {
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
          
          if (item.type === ItemTypes.gloves) {
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
          
          if (item.type === ItemTypes.legwear) {
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
          
          if (item.type === ItemTypes.footwear) {
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
          if ([ItemTypes.lightWeapon, ItemTypes.heavyWeapon, ItemTypes.rangedWeapon].includes(item.type)) {
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
          
          if ([ ItemTypes.offhand, ItemTypes.trinket ].includes(item.type)) {
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
        }
      };
    }
  }

  // remove an item and put it into your inventory
  if (command.match(/^(?:remove|unequip) (.*)$/)) {
    if (!character.job) {
      emitSelf("You must finish creating your new character first.");
      return true;
    }
  
    const removePattern = /^(?:remove|unequip) (.*)$/;
    const match = command.match(removePattern);
    
    if (!match) return false;

    if (match.length > 1) {
      const userInput: string = match[1];

      if (character.headgear && items.get(character.headgear).keywords.includes(userInput)) {
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

      if (character.armor && items.get(character.armor).keywords.includes(userInput)) {
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

      if (character.gloves && items.get(character.gloves).keywords.includes(userInput)) {
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

      if (character.legwear && items.get(character.legwear).keywords.includes(userInput)) {
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

      if (character.footwear && items.get(character.footwear).keywords.includes(userInput)) {
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

      if (character.weapon && items.get(character.weapon).keywords.includes(userInput)) {
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

      if (character.offhand && items.get(character.offhand).keywords.includes(userInput)) {
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
    }
  }

  return false;
}

export default handleCharacterCommand;
