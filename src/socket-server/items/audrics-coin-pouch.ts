import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.AUDRICS_COIN_POUCH;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A small, canvas pouch, stuffed with a handful of coin.";
const keywords: string[] = ['pouch', 'coin pouch', 'canvas pouch'];
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;
const quest: boolean = true;

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
  quest
};
