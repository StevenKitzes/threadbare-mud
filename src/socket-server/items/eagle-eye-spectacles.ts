import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.EAGLE_EYE_SPECTACLES;
const type: ItemTypes = ItemTypes.headgear;
const title: string = 'Eagle Eye Spectacles';
const description: string = "A pair of [Eagle Eye Spectacles], that despite their rather bookish appearance are said to enable improved marksmanship through sharpened eyesight.";
const keywords: string[] = ['spectacles', 'glasses', 'eagle eye', 'eagle eye spectacles', 'eagle eye glasses', 'eagle spectacles', 'eagle glasses', 'magic spectacles', 'magic glasses'];
const value: number = 500;
const weight: number = 1;

const armorValue: number = 0;
const statEffects: StatEffect[] = [{
  stat: EffectStat.rangedAttack,
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
