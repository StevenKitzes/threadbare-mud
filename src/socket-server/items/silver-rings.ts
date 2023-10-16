import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SILVER_RINGS;
const type: ItemTypes = ItemTypes.gloves;
const title: string = "a set of silver rings";
const description: string = "A set of various ornamented [silver rings], just for show, intended to demonstrate the wearer's wealth and taste.";
const keywords: string[] = ['silver rings'];
const value: number = 200;
const weight: number = 1;

const armorValue: number = 0;

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
