import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SOFT_BLACK_BOOTS;
const type: ItemTypes = ItemTypes.footwear;
const title: string = "a pair of soft, black boots";
const description: string = "A pair of black boots made of soft, supple leather.  They are very comfortable and stride atop soft soles that fall quietly.";
const keywords: string[] = ['soft black boots', 'black boots', 'soft boots', 'boots'];
const value: number = 10;

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
