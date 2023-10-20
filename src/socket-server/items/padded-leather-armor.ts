import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PADDED_LEATHER_ARMOR;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "This [padded leather armor] provides a very basic level of protection from harm to the wearer.  It is a little bulky and awkward, made of tough leather panels over a heavy cloth backing; but it's better than nothing if you expect to get into a scrap.";
const keywords: string[] = ['padded leather armor', 'leather armor', 'padded armor'];
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
