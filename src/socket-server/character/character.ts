import { HandlerOptions } from '../server';
import { getEmitters } from '../../utils/emitHelper';
import { items } from '../items/items';
import { scenes } from '../scenes/scenes';
import { writeCharacterInventory } from '../../../sqlite/sqlite';

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
      actorText.push(`On your body, you have donned ${items.get(character.armor).title}`);
      naked = false;
    }
    if (character.gloves) {
      actorText.push(`Covering your hands: ${items.get(character.gloves).title}`);
      naked = false;
    }
    if (character.legwear) {
      actorText.push(`Your legs are covered by ${items.get(character.legwear).title}`);
      naked = false;
    }
    if (character.footwear) {
      actorText.push(`Your feet are protected by ${items.get(character.footwear).title}`);
      naked = false;
    }
    if (character.weapon) {
      actorText.push(`In case of trouble, you carry ${items.get(character.weapon).title}`);
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

    if (character.inventory.length === 0) {
      emitSelf("You are not carrying any belongings.");
    } else {
      emitSelf([
        "Among your belongings you find:",
        ...character.inventory.map(i => `${items.get(i).title} (${items.get(i).type})`),
        "(Try [look inventory <item>] for a closer inspection.)"
      ])
    }

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
        if (items.get(character.inventory[i]).keywords.includes(userInput)) {
          const itemId: string = items.get(character.inventory[i]).id;
          const itemTitle: string = items.get(character.inventory[i]).title;
          const newInventory: string[] = [...character.inventory];
          newInventory.splice(i, 1);
          if (writeCharacterInventory(character.id, newInventory)) {
            character.inventory = newInventory;
            scenes.get(character.scene_id).publicInventory.push(itemId);
            emitSelf(`You dropped ${itemTitle}.`);
            emitOthers(`${character.name} dropped ${itemTitle}.`);
            return true;
          }
        }
      };
      emitSelf(`You do not have any [${userInput}] to drop.`);
    }

    return true;
  }

  // pick up an item in your current scene
  if (command.match(/^get /)) {
    const getPattern = /^get (.*)$/;
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
      emitSelf(`You do not have any [${userInput}] to drop.`);
    }

    return true;
  }

  // look at an item in your inventory
  if (command.match(/^look inventory /)) {
    const lookPattern = /^look inventory (.*)$/;
    const match = command.match(lookPattern);
    
    if (!match) return false;

    if (match.length > 1) {
      const userInput: string = match[1];
      for (let i = 0; i < character.inventory.length; i++) {
        if (items.get(character.inventory[i]).keywords.includes(userInput)) {
          const itemDescription: string = items.get(character.inventory[i]).description;
          const itemTitle: string = items.get(character.inventory[i]).title;
          emitSelf(itemDescription);
          emitOthers(`${character.name} is closely inspecting ${itemTitle}.`);
          return true;
        }
      };
    }
  }

  return false;
}

export default handleCharacterCommand;
