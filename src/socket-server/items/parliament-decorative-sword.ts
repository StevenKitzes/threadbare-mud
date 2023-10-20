import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PARLIAMENT_DECORATIVE_SWORD;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const damageType: DamageType = csvData.damageType;
const title: string = csvData.title;
const description: string = "A mirror-polished [decorative longsword], with the crest of the capital city of Parliament engraved into the hilt.  It is combat ready, if only just; more meant for show.";
const keywords: string[] = ['decorative longsword', 'longsword', 'parliamentary longsword'];
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
