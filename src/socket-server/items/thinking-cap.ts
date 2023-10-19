import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.THINKING_CAP;
const type: ItemTypes = ItemTypes.headgear;
const title: string = 'Thinking Cap';
const description: string = "A cheekily named [Thinking Cap], this festively colored, woven beret is said to clear the wearer's thoughts.";
const keywords: string[] = ['beret', 'cap', 'magic cap', 'thinking cap'];
const value: number = 750;
const weight: number = 1;

const armorValue: number = 1;
const statEffects: StatEffect[] = [{
  stat: EffectStat.savvy,
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
