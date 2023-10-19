import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.DEFTSTEP_BOOTS;
const type: ItemTypes = ItemTypes.footwear;
const title: string = 'Deftstep Boots';
const description: string = "A set of thin, leather [Deftstep Boots], said to quicken the wearer's step and make them harder to hit in a fight.";
const keywords: string[] = ['boots', 'magic boots', 'deftstep boots'];
const value: number = 1200;
const weight: number = 2;

const armorValue: number = 2;
const statEffects: StatEffect[] = [{
  stat: EffectStat.dodge,
  amount: 1
}];

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  armorValue,
  statEffects
};
