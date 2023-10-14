import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.STYLISH_BOOTS;
const type: ItemTypes = ItemTypes.footwear;
const title: string = "a pair of stylish boots";
const description: string = "These [stylish boots] feature premium leather and slightly raised heels.";
const keywords: string[] = ['stylish boots', 'boots'];
const value: number = 250;
const weight: number = 2;

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
