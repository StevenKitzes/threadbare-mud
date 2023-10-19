import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PROTECTION_CHARM;
const type: ItemTypes = ItemTypes.offhand;
const title: string = 'a Protection Charm';
const description: string = "A small charm wrought of semi-precious metals, this [Protection Charm] is said to be imbued with magic that will protect whosoe'er carries it from harm.";
const keywords: string[] = ['charm', 'magic charm', 'protection charm'];
const value: number = 750;
const weight: number = 1;

const statEffects: StatEffect[] = [{
  stat: EffectStat.defense,
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
  statEffects
};
