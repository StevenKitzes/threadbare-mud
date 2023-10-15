import { REGEX_DRINK_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.SMALL_HEALING_POTION;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a small vial of healing potion";
const description: string = "A [small vial] of opaque, purple liquid, corked at the top.  The potion fizzes, and mist floats in the empty space at the top of the vial.  You recognize this as a healing draught.";
const keywords: string[] = ['vial', 'small vial', 'healing potion', 'small potion', 'small healing potion', 'potion'];
const value: number = 35;
const weight: number = 1;
const healAmount: number = 100;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  if (consumeItem({
    handlerOptions,
    actionAliases: REGEX_DRINK_ALIASES,
    targetAliases: keywords.join('|'),
    itemId: id,
    itemTitle: title,
    healAmount,
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
  healAmount,
};
