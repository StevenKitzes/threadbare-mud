import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.TRUESTRIKE_GLOVES;
const type: ItemTypes = ItemTypes.gloves;
const title: string = 'Truestrike Gloves';
const description: string = "A pair of black, leather [Truestrike Gloves], these are said to make it easier to strike an opponent in a fight.";
const keywords: string[] = ['gloves', 'truestrike gloves', 'magic gloves'];
const value: number = 1200;
const weight: number = 2;

const armorValue: number = 2;
const statEffects: StatEffect[] = [{
  stat: EffectStat.accuracy,
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
