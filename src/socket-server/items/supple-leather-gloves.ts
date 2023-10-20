import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SUPPLE_LEATHER_GLOVES;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "These beautiful, supple [leather gloves] are lined with soft, warm cashmere inside.";
const keywords: string[] = ['gloves', 'leather gloves', 'supple leather gloves'];
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
  armorValue,
};
