import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.FLICKWRIST_BRACERS;
const type: ItemTypes = ItemTypes.gloves;
const title: string = 'Flickwrist Bracers';
const description: string = "A set of pristine, leather [Flickwrist Bracers] to be worn on the wrists, these are said to improve the wearer's effectiveness at fighting with light weapons.";
const keywords: string[] = ['bracers', 'flickwrist bracers', 'magic bracers'];
const value: number = 1200;
const weight: number = 2;

const armorValue: number = 2;
const statEffects: StatEffect[] = [{
  stat: EffectStat.lightAttack,
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
