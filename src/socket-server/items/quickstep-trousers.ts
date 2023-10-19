import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.QUICKSTEP_TROUSERS;
const type: ItemTypes = ItemTypes.legwear;
const title: string = 'Quickstep Trousers';
const description: string = "A pair of blue and light blue striped [Quickstep Trousers].  They are said to lighten the wearer on their feet.";
const keywords: string[] = ['trousers', 'magic trousers', 'quickstep trousers', 'pants', 'magic pants', 'quickstep'];
const value: number = 1000;
const weight: number = 2;

const armorValue: number = 1;
const statEffects: StatEffect[] = [{
  stat: EffectStat.agility,
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
