import { REGEX_EAT_ALIASES } from "../../constants";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.SWEETROLL;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A tasty looking sweetroll.";
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;
const healAmount: number = csvData.healAmount;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  if (consumeItem({
    handlerOptions,
    actionAliases: REGEX_EAT_ALIASES,
    keywords,
    itemId: id,
    itemTitle: title,
    healAmount
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
  healAmount
};
