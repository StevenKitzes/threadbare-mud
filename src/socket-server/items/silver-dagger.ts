import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SILVER_DAGGER;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A shining, [silver dagger], polished to gleam in the light.  A mark of prestige, while still demonstrating some bite to match any bark.";
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const damageValue: number = csvData.damageValue;
const damageType: number = DamageType.piercing;

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
  damageType,
};
