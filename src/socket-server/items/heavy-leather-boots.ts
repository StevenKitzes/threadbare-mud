import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.HEAVY_LEATHER_BOOTS;
const type: ItemTypes = ItemTypes.footwear;
const title: string = "a pair of heavy, leather boots";
const description: string = "A pair of [heavy leather boots] made of thick, hardened hide.  Not comfortable for a long march, but very protective.";
const keywords: string[] = ['heavy leather boots', 'heavy boots', 'leather boots', 'boots'];
const value: number = 40;
const weight: number = 4;

// Optional
const armorValue: number = 2;

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  armorValue
};
