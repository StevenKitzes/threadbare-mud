import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.STRONGSLEEVES_COAT;
const type: ItemTypes = ItemTypes.armor;
const title: string = 'Strongsleeves Coat';
const description: string = "This [Strongsleeves Coat] is made of thick, heavy fabric to protect the wearer somewhat, like a light gambeson, and is said to energize the wearer's muscles.";
const keywords: string[] = ['coat', 'strongsleeves', 'strongsleeves coat', 'magic coat'];
const value: number = 1500;
const weight: number = 7;

const armorValue: number = 4;
const statEffects: StatEffect[] = [{
  stat: EffectStat.strength,
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
