import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.STANDARD_RAPIER;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const damageType: DamageType = csvData.damageType;
const title: string = csvData.title;
const description: string = "A [standard rapier], suitable for duels and light combat.  It has a sharp tip and a flexible blade.";
const keywords: string[] = ['standard rapier', 'rapier'];
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
