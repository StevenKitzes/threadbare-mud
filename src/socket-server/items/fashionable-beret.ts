import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.FASHIONABLE_BERET;
const type: ItemTypes = ItemTypes.headgear;
const title: string = "a fashionable beret";
const description: string = "This [fashionable beret] is made of fine wool and has a round, flat crown.  It is stitched with accents of golden thread.";
const keywords: string[] = ['beret', 'fashionable beret', 'hat'];
const value: number = 100;
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
