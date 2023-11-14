import { Item, ItemIds } from "../socket-server/items/items";
import { errorParts } from "./log";
import { commandMatchesKeywordsFor, commandMatchesKeywordsForSaleTo } from "./makeMatcher";

export function uniqueMatchCount(command: string, items: Item[], aliases: string): number {
  const foundIds: Set<ItemIds> = new Set<ItemIds>();

  try {
    for (let i = 0; i < items.length; i++) {
      if (commandMatchesKeywordsFor(command, items[i].keywords, aliases)) foundIds.add(items[i].id);
    }
  } catch (err: any) {
    errorParts(['Error in uniqueMatchCount:', err.toString()]);
    return 0;
  }

  return foundIds.size;
}

export function uniqueSellToMatchCount(command: string, items: Item[]): number {
  const foundIds: Set<ItemIds> = new Set<ItemIds>();

  try {
    for (let i = 0; i < items.length; i++) {
      if (commandMatchesKeywordsForSaleTo(command, items[i].keywords)) foundIds.add(items[i].id);
    }
  } catch (err: any) {
    errorParts(['Error in uniqueMatchCount:', err.toString()]);
    return 0;
  }

  return foundIds.size;
}
