import { Item, ItemIds } from "../socket-server/items/items";
import { commandMatchesKeywordsFor } from "./makeMatcher";

export function uniqueMatchCount(command: string, items: Item[], aliases: string): number {
  const foundIds: Set<ItemIds> = new Set<ItemIds>();

  for (let i = 0; i < items.length; i++) {
    if (commandMatchesKeywordsFor(command, items[i].keywords, aliases)) foundIds.add(items[i].id);
  }

  return foundIds.size;
}
