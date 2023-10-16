import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PARLIAMENT_BOOTS;
const type: ItemTypes = ItemTypes.footwear;
const title: string = "a set of Parliamentary plated boots";
const description: string = "A sparkling set of [polished plated boots], embossed with the crest of the town of Parliament, capital of the Realm of Ixpanne.";
const keywords: string[] = ['polished plated boots', 'polished boots', 'plated boots'];
const value: number = 2000;
const weight: number = 6;

const armorValue: number = 6;

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
