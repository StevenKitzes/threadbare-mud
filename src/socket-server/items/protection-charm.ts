import { EffectStat, StatEffect } from "../../types";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PROTECTION_CHARM;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A small charm wrought of semi-precious metals, this [Protection Charm] is said to be imbued with magic that will protect whosoe'er carries it from harm.";
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const statEffects: StatEffect[] = [{
  stat: EffectStat.defense,
  amount: 1
}];

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
  statEffects
};
