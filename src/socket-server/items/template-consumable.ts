/* Use this template to create new items

import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = ;
const keywords: string[] = itemPropsToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;
const healAmount: number = csvData.healAmount;
const consumeEffects: TemporaryEffect[] = [
  {
    amount: ,
    duration: ,
    name: ,
    stat: 
  }
];

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  if (consumeItem({
    handlerOptions,
    actionAliases: ,
    keywords,
    itemId: id,
    itemTitle: title,
    healAmount,
    consumeEffects,
  })) return true;

  return false;
};

function randomizeValue (): number {
  return value = itemPriceRandomizer(csvData.value);
}

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  randomizeValue,
  weight,
  handleItemCommand,
  healAmount,
  consumeEffects
};

*/
