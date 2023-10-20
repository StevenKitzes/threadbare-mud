import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.FLORAL_WOODEN_SHIELD;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A [wooden shield], painted with a lovely floral design in many bright, beautiful colors.  It seems sturdy enough for play fighting might not be meant for combat duty.";
const keywords: string[] = ['shield', 'wooden shield', 'floral shield', 'floral wooden shield', 'wooden floral shield', 'flower shield'];
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
