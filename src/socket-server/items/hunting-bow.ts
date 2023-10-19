import { EffectStat, StatEffect } from "../../types";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.HUNTING_BOW;
const type: ItemTypes = ItemTypes.rangedWeapon;
const title: string = "a basic hunting bow";
const description: string = "A [basic hunting bow], made of sound wood.  A capable enough piece of equipment that it may even hold its own on the battlefield, though it isn't intended for that purpose.";
const keywords: string[] = ['bow', 'hunting bow', 'basic hunting bow'];
const value: number = 150;
const weight: number = 3;

const damageValue: number = 15;
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
