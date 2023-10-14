import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SUPPLE_LEATHER_GLOVES;
const type: ItemTypes = ItemTypes.gloves;
const title: string = "supple leather gloves";
const description: string = "These beautiful, supple [leather gloves] are lined with soft, warm cashmere inside.";
const keywords: string[] = ['gloves', 'leather gloves', 'supple leather gloves'];
const value: number = 150;
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
  armorValue,
};
