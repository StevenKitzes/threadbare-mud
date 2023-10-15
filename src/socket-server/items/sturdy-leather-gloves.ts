import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.STURDY_LEATHER_GLOVES;
const type: ItemTypes = ItemTypes.gloves;
const title: string = "sturdy leather gloves";
const description: string = "A pair of [sturdy leather gloves], these provide modest protection to the hands, but not much feel for the wearer.";
const keywords: string[] = ['sturdy leather gloves', 'sturdy gloves', 'leather gloves', 'gloves'];
const value: number = 30;
const weight: number = 2;

const armorValue: number = 2;

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
