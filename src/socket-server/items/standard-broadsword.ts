import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.STANDARD_BROADSWORD;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const damageType: DamageType = csvData.damageType;
const title: string = csvData.title;
const description: string = "A [standard broadsword], suitable for typical combat conditions.  It is sharp, and seems sturdy enough.";
const keywords: string[] = ['standard broadsword', 'broadsword'];
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
