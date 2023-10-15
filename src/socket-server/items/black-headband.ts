import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.BLACK_HEADBAND;
const type: ItemTypes = ItemTypes.headgear;
const title: string = "a black headband";
const description: string = "A [black headband], no more than a simple strip of black cloth to tie around the head.";
const keywords: string[] = ['black headband', 'headband'];
const value: number = 3;
const weight: number = 1;

// Optional
const armorValue: number = 1;

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
