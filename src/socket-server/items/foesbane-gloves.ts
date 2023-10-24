import { EffectStat, StatEffect } from "../../types";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.FOESBANE_GLOVES;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A pair of ambitiously named [Foesbane Gloves], made of stout leather and said to enable the wearer to fight more effectively.";
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const armorValue: number = csvData.armorValue;
const statEffects: StatEffect[] = [{
  stat: EffectStat.damage,
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
  armorValue,
  statEffects
};
