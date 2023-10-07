import { Item, items } from "../socket-server/items/items";
import { Scene, scenes } from "../socket-server/scenes/scenes";

export function appendItemsHereString(actorText: string[], sceneId: string): void {
  const scene: Scene | undefined = scenes.get(sceneId);
  if (scene === undefined) {
    return console.error("Could not find scene by id trying to append items to actorText.", sceneId);
  }

  const itemTitles: string[] = [];
  
  for (let i = 0; i < scene.publicInventory.length; i++) {
    const item: Item | undefined = items.get(scene.publicInventory[i]);
    if (item === undefined) {
      return console.error("Could not find item by id trying to append items to actorText.", scene.publicInventory[i]);
    }
    itemTitles.push(`There is ${item.title} laying here.`);
  }

  if (itemTitles.length === 0) return;
  
  actorText.push(...itemTitles);
  actorText.push('You can look more closely with [look scene (item)].');
}

export default appendItemsHereString;
