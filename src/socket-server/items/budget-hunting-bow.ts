import { EffectStat, StatEffect } from "../../types";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.BUDGET_HUNTING_BOW;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A [cheap bow], made of cheap wood.  Not the best you can get, but will get the job done for simple archery.";
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const damageValue: number = csvData.damageValue;
const damageType: DamageType = csvData.damageType;

const statEffects: StatEffect[] = [
  {
    stat: EffectStat.agility,
    amount: -2
  },
  {
    stat: EffectStat.defense,
    amount: 2
  },
];

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
  damageType,
  statEffects
};
