import { HandlerOptions } from "../socket-server/server";
import { Item } from "../socket-server/items/items";
import getEmitters from "./emitHelper";
import { uniqueMatchCount } from "./uniqueMatchCount";
import { Scene, getItemsForSaleAtScene } from "../socket-server/scenes/scenes";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES } from "../constants";
import { captureFrom } from "./makeMatcher";

export function isAmbiguousPurchaseRequest(handlerOptions: HandlerOptions, scene: Scene): boolean {
  const { emitOthers, emitSelf } = getEmitters(handlerOptions.socket, scene.id);
  if (!scene.getSceneNpcs) return false;

  // get all possible purchase items
  const buyables: Item[] = getItemsForSaleAtScene(handlerOptions.character.id, scene.id);
  
  if (uniqueMatchCount(handlerOptions.command, buyables, REGEX_BUY_ALIASES) > 1) {
    emitOthers(`${handlerOptions.character.name} is confusing local vendors with imprecise language.`);
    emitSelf(`There are multiple items for sale here that could be described as ${captureFrom(handlerOptions.command, REGEX_BUY_ALIASES)}.  Be more precise to ensure you buy the right thing.`);
    return true;
  }

  return false;
}

export function isAmbiguousLookRequest(handlerOptions: HandlerOptions, itemList: Item[]): boolean {
  const { emitOthers, emitSelf } = getEmitters(handlerOptions.socket, handlerOptions.character.scene_id);

  if (uniqueMatchCount(handlerOptions.command, itemList, REGEX_LOOK_ALIASES) > 1) {
    emitOthers(`${handlerOptions.character.name} is looking all over the place in a daze.`);
    emitSelf(`There are multiple items in the vicinity (your inventory, worn, in the scene, for sale...?) that could be described as ${captureFrom(handlerOptions.command, REGEX_LOOK_ALIASES)}.  Be more precise to ensure you are inspecting the right thing.`);
    return true;
  }

  return false;
}
