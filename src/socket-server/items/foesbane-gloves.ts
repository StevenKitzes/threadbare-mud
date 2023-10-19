import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.FOESBANE_GLOVES;
const type: ItemTypes = ItemTypes.gloves;
const title: string = 'Foesbane Gloves';
const description: string = "A pair of ambitiously named [Foesbane Gloves], made of stout leather and said to enable the wearer to fight more effectively.";
const keywords: string[] = ['gloves', 'foesbane gloves', 'magic gloves'];
const value: number = 1200;
const weight: number = 2;

const armorValue: number = 2;
const statEffects: StatEffect[] = [{
  stat: EffectStat.damage,
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
