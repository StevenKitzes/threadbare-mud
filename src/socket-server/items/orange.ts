import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.ORANGE;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "an orange";
const description: string = "A nice, round, juicy, delicious orange, ready to peel and eat.";
const keywords: string[] = ['orange', 'juicy orange', 'delicious orange', 'citrus'];
const value: number = 4;
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
