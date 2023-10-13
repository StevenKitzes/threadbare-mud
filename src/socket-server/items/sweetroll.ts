import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.SWEETROLL;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a tasty sweetroll";
const description: string = "A tasty looking sweetroll.";
const keywords: string[] = ['sweetroll', 'roll'];
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
