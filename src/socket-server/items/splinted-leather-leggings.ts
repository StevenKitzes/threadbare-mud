import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SPLINTED_LEATHER_LEGGINGS;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "This set of [splinted leather leggings] is composed of a tough, padded lining, covered by protective bands of hardened leather.";
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

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
