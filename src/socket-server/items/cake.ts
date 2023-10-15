import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.CAKE;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a tasty cake";
const description: string = "A freshly baked cake, sweet and covered with little bits of fruit and a sugar glaze.";
const keywords: string[] = ['cake', 'fruit cake', 'tart'];
const value: number = 8;
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
  handleItemCommand,
  healAmount
};
