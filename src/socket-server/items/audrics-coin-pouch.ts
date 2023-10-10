import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.AUDRICS_COIN_POUCH;
const type: ItemTypes = ItemTypes.trinket;
const title: string = "Audric's coin pouch";
const description: string = "A small, canvas pouch, stuffed with a handful of coin.";
const keywords: string[] = ['pouch', 'coin pouch', 'canvas pouch'];
const value: number = 50;
const weight: number = 1;
const quest: boolean = true;

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  quest
};
