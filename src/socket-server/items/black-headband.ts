import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.BLACK_HEADBAND;
const type: ItemTypes = ItemTypes.headgear;
const title: string = "a black headband";
const description: string = "A simple strip of black cloth, tied around the head.";
const keywords: string[] = ['black headband', 'headband'];
const value: number = 3;

// Optional
const armorValue: number = 1;

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  armorValue
};
