import { EffectStat, StatEffect } from "../../types";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.HUNTING_BOW;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A [basic hunting bow], made of sound wood.  A capable enough piece of equipment that it may even hold its own on the battlefield, though it isn't intended for that purpose.";
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
