import { EffectStat, StatEffect } from "../../types";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.HUNTING_CROSSBOW;
const type: ItemTypes = ItemTypes.rangedWeapon;
const title: string = "a hunting crossbow";
const description: string = "A [hunting crossbow], of sound build.  Not meant for combat, it is clunky and difficult to reload and manage on the battlefield, but it will fire straight and true.";
const keywords: string[] = ['crossbow', 'hunting crossbow'];
const value: number = 250;
const weight: number = 5;

const damageValue: number = 25;
const damageType: DamageType = DamageType.piercing;

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
