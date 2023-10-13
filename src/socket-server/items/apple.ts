import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.APPLE;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "an apple";
const description: string = "A shiny, juicy, delicious [red apple], with a little stem sticking out the top with a leaf.";
const keywords: string[] = ['apple', 'red apple', 'shiny apple', 'shiny red apple', 'red shiny apple'];
const value: number = 3;
const weight: number = 1;
const healAmount: number = 10;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  if (consumeItem({
    handlerOptions,
    actionAliases: REGEX_EAT_ALIASES,
    targetAliases: keywords.join('|'),
    itemId: id,
    itemTitle: title,
    healAmount
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
