import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.LOOSE_BLACK_TUNIC;
const type: ItemTypes = ItemTypes.armor;
const title: string = "a loose black tunic";
const description: string = "A loose-fitting, comfortable, black tunic.  The sleeves are bound tightly to the wrists with strips of cloth wrappings.";
const keywords: string[] = ['loose black tunic', 'black tunic', 'tunic'];
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
  armorValue,
};
