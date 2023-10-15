import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.LIGHT_LEATHER_CAP;
const type: ItemTypes = ItemTypes.headgear;
const title: string = "a light leather cap";
const description: string = "A [light leather cap], unadorned, made to shield the wearer from the elements as much as anything else. Provides a tiny bit of protection to the head.";
const keywords: string[] = ['light leather cap', 'leather cap', 'light cap', 'cap'];
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
