import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.LOOSE_BLACK_PANTS;
const type: ItemTypes = ItemTypes.legwear;
const title: string = "a pair of loose, black pants";
const description: string = "A loose-fitting, comfortable pair of black trousers.  The ankles of these [loose black pants] are bound snugly with strips of gray cloth wrappings.";
const keywords: string[] = ['loose black pants', 'black pants', 'pants'];
const value: number = 10;
const weight: number = 2;

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
