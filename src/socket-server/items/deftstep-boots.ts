import { EffectStat, StatEffect } from "../../types";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.DEFTSTEP_BOOTS;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A set of thin, leather [Deftstep Boots], said to quicken the wearer's step and make them harder to hit in a fight.";
const keywords: string[] = ['boots', 'magic boots', 'deftstep boots'];
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const armorValue: number = csvData.armorValue;
const statEffects: StatEffect[] = [{
  stat: EffectStat.dodge,
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
