import { InventoryDescriptionHelper } from "../types";
import { Item, items } from "../socket-server/items/items";
import { Scene, scenes } from "../socket-server/scenes/scenes";
import { errorParts } from "./log";

export function appendItemsHereString(actorText: string[], sceneId: string): void {
  const scene: Scene | undefined = scenes.get(sceneId);
  if (scene === undefined) {
    return errorParts(["Could not find scene by id trying to append items to actorText.", sceneId]);
  }

  const itemDescriptions: InventoryDescriptionHelper[] = [];
  
  scene.publicInventory.forEach(i => {
    const item: Item | undefined = items.get(i);
    if (item === undefined) return;
    const itemDesc: InventoryDescriptionHelper | undefined =
      itemDescriptions.find(desc => desc.id === item.id);
    if (itemDesc === undefined)
      itemDescriptions.push({ id: item.id, desc: item.title, type: item.type, count: 1 });
    else
      itemDesc.count++;
  })

  actorText.push(...[
    ...itemDescriptions.map(i => `There is ${i.desc}${i.count > 1 ? ` {(x${i.count})}` : ''} laying here. (${i.type})`)
  ])
}

export default appendItemsHereString;
