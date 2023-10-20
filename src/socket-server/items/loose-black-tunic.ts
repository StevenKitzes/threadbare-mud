import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.LOOSE_BLACK_TUNIC;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A loose-fitting, comfortable, black tunic.  The sleeves of this [loose black tunic] are bound tightly to the wrists with strips of gray cloth wrappings.";
const keywords: string[] = ['loose black tunic', 'black tunic', 'tunic'];
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
