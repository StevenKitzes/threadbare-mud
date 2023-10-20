import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.FASHIONABLE_BERET;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "This [fashionable beret] is made of fine wool and has a round, flat crown.  It is stitched with accents of golden thread.";
const keywords: string[] = ['beret', 'fashionable beret', 'hat'];
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

// Optional
const armorValue: number = csvData.armorValue;

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
  armorValue
};
