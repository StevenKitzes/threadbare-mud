import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.LOOSE_BLACK_TUNIC;
const type: ItemTypes = ItemTypes.armor;
const title: string = "a loose black tunic";
const description: string = "A loose-fitting, comfortable, black tunic.  The sleeves of this [loose black tunic] are bound tightly to the wrists with strips of gray cloth wrappings.";
const keywords: string[] = ['loose black tunic', 'black tunic', 'tunic'];
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
  armorValue,
};
