import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.BREAD_LOAF;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a fresh loaf of bread";
const description: string = "A freshly baked loaf of bread, just firm enough and just fluffy enough, and it smells great.";
const keywords: string[] = ['bread', 'bread loaf', 'loaf of bread'];
const value: number = 5;
const weight: number = 1;
const healAmount: number = 15;

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
