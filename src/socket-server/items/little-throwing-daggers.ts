import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.LITTLE_THROWING_DAGGERS;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const damageType: DamageType = csvData.damageType;
const title: string = csvData.title;
const description: string = "A simple, but effective, set of [little throwing daggers] for the deft of hand.  They are made of plain steel, tip to butt.";
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

// Optional
const damageValue: number = csvData.damageValue;

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
  damageValue,
  damageType
};
