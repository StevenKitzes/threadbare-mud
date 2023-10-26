import { HandlerOptions } from "../socket-server/server";
import { Item } from "../socket-server/items/items";
import getEmitters from "./emitHelper";
import { uniqueMatchCount } from "./uniqueMatchCount";
import { Navigable, Scene, getItemsForSaleAtScene } from "../socket-server/scenes/scenes";
import { REGEX_BUY_ALIASES, REGEX_GO_ALIASES, REGEX_LOOK_ALIASES } from "../constants";
import { allTokensMatchKeywords, captureFrom, commandMatchesKeywordsFor } from "./makeMatcher";

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

export function isAmbiguousNavRequest(handlerOptions: HandlerOptions, navigables: Navigable[]): boolean {
  const { emitOthers, emitSelf } = getEmitters(handlerOptions.socket, handlerOptions.character.scene_id);

  let foundMatch: boolean = false;

  for (let i = 0; i < navigables.length; i++) {
    if (
      commandMatchesKeywordsFor(
        handlerOptions.command,
        navigables[i].keywords,
        `${REGEX_GO_ALIASES}${navigables[i].extraActionAliases ? `|${navigables[i].extraActionAliases}` : ''}`
      ) ||
      allTokensMatchKeywords(handlerOptions.command, navigables[i].keywords)
    ) {
      if (foundMatch) {
        emitOthers(`${handlerOptions.character.name} looks around as if they want to go somewhere, but they aren't sure where.`);
        emitSelf(`There are multiple ways you can go from here, that could be described by the phrase [${handlerOptions.command}].  Be more specific so you don't accidentally go the wrong direction!`)
        return true;
      }
      foundMatch = true;
    }
  }

  return false;
}
