import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.ELEGANT_DOUBLET;
const type: ItemTypes = ItemTypes.armor;
const title: string = "an elegant doublet";
const description: string = "This fitted, [elegant doublet] features silken sleeves and a beautifully embroidered bodice.";
const keywords: string[] = ['doublet', 'elegant doublet'];
const value: number = 250;
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
  armorValue,
};