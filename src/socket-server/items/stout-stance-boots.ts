import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.STOUT_STANCE_BOOTS;
const type: ItemTypes = ItemTypes.footwear;
const title: string = 'Stout Stance Boots';
const description: string = "A pair of slick, black [Stout Stance Boots], said to stabilize the wearer's balance to enable more skilled attacks with heavy weapons.";
const keywords: string[] = ['boots', 'stout stance boots', 'stance boots', 'stout boots', 'magic boots'];
const value: number = 1200;
const weight: number = 3;

const armorValue: number = 2;
const statEffects: StatEffect[] = [{
  stat: EffectStat.heavyAttack,
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
