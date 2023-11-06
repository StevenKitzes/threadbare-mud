import { HandlerOptions } from "../socket-server/server";
import { Item } from "../socket-server/items/items";
import getEmitters from "./emitHelper";
import { uniqueMatchCount, uniqueSellToMatchCount } from "./uniqueMatchCount";
import { Navigable, Scene, getItemsForSaleAtScene } from "../socket-server/scenes/scenes";
import { REGEX_BUY_ALIASES, REGEX_GO_ALIASES, REGEX_LOOK_ALIASES, REGEX_SELL_ALIASES } from "../constants";
import { allTokensMatchKeywords, captureFrom, captureSellItemToVendor, commandMatchesKeywordsFor, makeMatcher } from "./makeMatcher";
import { getInventoryAndWorn } from "../socket-server/character/character";
import { NPC, isMerchant } from "../socket-server/npcs/npcs";

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

export function isAmbiguousCaptureForItemList(capture: string, itemList: Item[]): boolean {
  let itemId: string | null = null;

  for (let i = 0; i < itemList.length; i++) {
    if (allTokensMatchKeywords(capture, itemList[i].keywords)) {
      if ( itemId === null ) {
        itemId = itemList[i].id;
      } else if ( itemId === itemList[i].id ) {
        continue;
      } else {
        return true;
      }
    }
  }

  return false;
}

export function isAmbiguousSellItemRequest(handlerOptions: HandlerOptions): boolean {
  const { character, socket } = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  if (
    uniqueMatchCount(handlerOptions.command, getInventoryAndWorn(character), REGEX_SELL_ALIASES) > 1 ||
    uniqueSellToMatchCount(handlerOptions.command, getInventoryAndWorn(character)) > 1
  ) {
    emitOthers(`${handlerOptions.character.name} makes a confused attempt to sell something from their collection.`);
    emitSelf(`You are wearing or carrying multiple items that could be described as [${captureFrom(handlerOptions.command, REGEX_SELL_ALIASES)}].  Be more precise to ensure you are selling the right thing.`);
    return true;
  }

  return false;
}

export function isAmbiguousSellBuyerRequest(handlerOptions: HandlerOptions, scene: Scene): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  // check if this is ambiguous due to sell request to vender keywords that match multiple vendors
  const specifiers = captureSellItemToVendor(command);
  if (specifiers !== null && scene.getSceneNpcs) {
    const npcs: NPC[] | undefined = scene.getSceneNpcs().get(handlerOptions.character.id);

    if (npcs !== undefined) {
      let merchantMatchCount = 0;
      for (let m = 0; m < npcs.length; m++) {
        if (allTokensMatchKeywords(specifiers.vendorSpecifier, npcs[m].getKeywords())) {
          merchantMatchCount++;
          if (merchantMatchCount > 1) {
            emitOthers(`${character.name} can't decide to whom they'd like to sell their items.`);
            emitSelf(`There are multiple merchants here that could be described as [${specifiers.vendorSpecifier}].  Be more specific so you don't sell to the wrong vendor!`);
            return true;
          }
        }
      }
    }

    return false;
  }

  // check if this is ambiguous due to generic sell request (no specified buyer) but multiple buyers present
  const genericSellMatch: string | null = captureFrom(command, REGEX_SELL_ALIASES);
  if (genericSellMatch !== null && scene.getSceneNpcs) {
    const npcs: NPC[] | undefined = scene.getSceneNpcs().get(handlerOptions.character.id);

    if (npcs !== undefined) {
      let npcMerchantCount: number = 0;
      for (let i = 0; i < npcs.length; i++) {
        if (isMerchant(npcs[i])) {
          if (npcMerchantCount > 0) {
            emitOthers(`${character.name} can't decide who to sell to.`);
            emitSelf(`There are multiple merchants here who might buy your items.  Try to [sell ~item~ to +merchant+] so you don't sell to the wrong merchant.`);
            return true;
          }
          npcMerchantCount++;
        }
      }
    }

    return false;
  }

  return false;
}
