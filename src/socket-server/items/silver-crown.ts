import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SILVER_CROWN;
const type: ItemTypes = ItemTypes.headgear;
const title: string = "a silver crown";
const description: string = "A [silver crown], purely decorative, intended to show off the wearer's status and wealth.";
const keywords: string[] = ['silver crown', 'crown'];
const value: number = 350;
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
