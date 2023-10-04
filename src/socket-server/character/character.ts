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
    emitSelf(`You observe yourself, a being named ${character.name}.`);
    return true;
  }

  // look at your stuff
  if (['look inventory', 'peek inventory', 'inventory'].includes(command)) {
    emitOthers(`${character.name} is digging through their belongings.`);

    if (character.inventory.length === 0) {
      emitSelf("You are not carrying any belongings.");
    } else {
      emitSelf([
        "Among your belongings you find:",
        ...character.inventory.map(i => `${items.get(i).title} (${items.get(i).type})`),
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
      const itemTitle: string = match[1];
      for (let i = 0; i < character.inventory.length; i++) {
        if (itemTitle === items.get(character.inventory[i]).title) {
          const itemId: string = items.get(character.inventory[i]).id;
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
      emitSelf(`You do not have any [${itemTitle}] to drop.`);
    }

    return true;
  }

  // pick up an item in your current scene
  if (
    command.match(/^get /)
  ) {
    const getPattern = /^get (.*)$/;
    const match = command.match(getPattern);
    
    if (!match) return false;

    if (match.length > 1) {
      const itemTitle: string = match[1];
      const sceneInventory: string[] = scenes.get(character.scene_id).publicInventory;

      for (let i = 0; i < sceneInventory.length; i++) {
        if (itemTitle === items.get(sceneInventory[i]).title) {
          const itemId: string = items.get(sceneInventory[i]).id;
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
      emitSelf(`You do not have any [${itemTitle}] to drop.`);
    }

    return true;
  }

  return false;
}

export default handleCharacterCommand;
