import { EffectStat, StatEffect } from "../../types";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.BUDGET_HUNTING_BOW;
const type: ItemTypes = ItemTypes.rangedWeapon;
const title: string = "a cheap bow for basic hunting";
const description: string = "A [cheap bow], made of cheap wood.  Not the best you can get, but will get the job done for simple archery.";
const keywords: string[] = ['bow', 'cheap bow'];
const value: number = 80;
const weight: number = 3;

const damageValue: number = 10;
const damageType: DamageType = DamageType.piercing;

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

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  damageValue,
  damageType,
  statEffects
};
