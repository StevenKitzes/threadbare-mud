import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PARLIAMENT_GAUNTLETS;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A beautiful, polished set of [plate gauntlets] etched with the livery of the town of Parliament, capital of Ixpanne.";
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
