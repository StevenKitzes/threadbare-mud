import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SMALL_ANVIL;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "This tiny anvil would be good for working on jewelry.";
const keywords: string[] = ['anvil', 'small anvil'];
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

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
};
