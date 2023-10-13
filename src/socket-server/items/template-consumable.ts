/* Use this template to create new items

import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.;
const type: ItemTypes = ItemTypes.consumable;
const title: string = ;
const description: string = ;
const keywords: string[] = ;
const value: number = ;
const weight: number = ;
const healAmount: number = ;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  if (consumeItem({
    handlerOptions,
    actionAliases: ,
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

*/
