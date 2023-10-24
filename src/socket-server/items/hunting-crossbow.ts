import { EffectStat, StatEffect } from "../../types";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.HUNTING_CROSSBOW;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A [hunting crossbow], of sound build.  Not meant for combat, it is clunky and difficult to reload and manage on the battlefield, but it will fire straight and true.";
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const damageValue: number = csvData.damageValue;
const damageType: DamageType = csvData.damageType;

const statEffects: StatEffect[] = [
  {
    stat: EffectStat.agility,
    amount: -4
  },
  {
    stat: EffectStat.defense,
    amount: +2
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
