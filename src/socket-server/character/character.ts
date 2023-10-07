import { HandlerOptions } from '../server';
import { getEmitters } from '../../utils/emitHelper';
import { Item, ItemTypes, items } from '../items/items';
import { scenes } from '../scenes/scenes';
import { writeCharacterData, writeCharacterInventory } from '../../../sqlite/sqlite';
import jStr from '../../utils/jStr';

export function handleCharacterCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitSelf, emitOthers } = getEmitters(socket, character.scene_id);

  // look at yourself
  if (command === 'look self') {
    emitOthers(`${character.name} is admiring themselves.`);

    const actorText: string[] = [];
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

    if (naked) actorText.unshift('You wear only a modest set of undergarments.');

    emitSelf(actorText);

    return true;
  }

  // look at your stuff
  if (['look inventory', 'peek inventory', 'inventory', 'inv'].includes(command)) {
    emitOthers(`${character.name} is digging through their belongings.`);

    const actorText: string[] = [`You have ${character.money} coin${character.money === 1 ? '' : 's'} in your pouch.`];
    if (character.inventory.length === 0) {
      actorText.push("You are not carrying any belongings.");
    } else {
      actorText.push(...[
        "Among your belongings you find:",
        ...character.inventory.map(i => `${items.get(i).title} (${items.get(i).type})`),
        "(Try [look inventory (item)] for a closer inspection.)"
      ])
    }
    emitSelf(actorText);

    return true;
  }

  // drop an item from your inventory
  if (command.match(/^drop /)) {
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
  if (command.match(/^(?:equip|wear|use) (.*)$/)) {
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
          
          if (item.type === ItemTypes.weapon) {
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
