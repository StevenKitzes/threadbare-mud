import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.PLUM;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a plum";
const description: string = "A purple plum, just ripe enough, just juicy enough, just sweet enough.";
const keywords: string[] = ['plum', 'purple plum', 'ripe plum', 'juicy plum'];
const value: number = 3;
const weight: number = 1;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  if (consumeItem({
    handlerOptions,
    actionAliases: REGEX_EAT_ALIASES,
    targetAliases: keywords.join('|'),
    itemId: id,
    itemTitle: title
  })) return true;

  return false;
};

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  handleItemCommand
};
