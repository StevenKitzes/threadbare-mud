import { OptsType } from "./getGameTextObject";
import { Item, items } from '../socket-server/items/items';
import { Scene, scenes } from '../socket-server/scenes/scenes';

export function lookSceneItem(
  command: string,
  inventory: string[],
  charName: string,
  emitOthers: (text: string | string[], opts?: OptsType) => void,
  emitSelf: (text: string | string[], opts?: OptsType) => void
): boolean {
  if (command.match(/^(?:look scene|inspect) /)) {
    const lookPattern = /^(?:look scene|inspect) (.*)$/;
    const match = command.match(lookPattern);
    
    if (!match) return false;

    if (match.length > 1) {
      const userInput: string = match[1];

      for (let i = 0; i < inventory.length; i++) {
        const item: Item | undefined = items.get(inventory[i]);
        if (item === undefined) {
          console.error("Could not find item by id while character tries to look at an item, item id:", inventory[i]);
          return false;
        }

        if (item.keywords.includes(userInput)) {
          const itemDescription: string = item.description;
          const itemTitle: string = item.title;
          emitSelf(itemDescription);
          emitOthers(`${charName} is closely inspecting ${itemTitle}.`);
          return true;
        }
      };

      return false;
    }
  }

  return false;
}

export default lookSceneItem;
