import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.REINFORCED_SAGGLEBAGS;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A fine set of [reinforced saddlebags], supported with iron framing to strengthen them.  They look like they can carry a lot of cargo.";
const keywords: string[] = ['reinforced saddlebags'];
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

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
};
