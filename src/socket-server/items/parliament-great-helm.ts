import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PARLIAMENT_GREAT_HELM;
const type: ItemTypes = ItemTypes.headgear;
const title: string = "a Parliamentary great helm";
const description: string = "A shining, immaculately polished [great helm] with bright plumage in the colors of the Realm of Ixpanne: blue, gold, and purple.  It has a visor that can be closed over the face for extra protection.";
const keywords: string[] = ['great helm', 'helm', 'parliamentary helm'];
const value: number = 1500;
const weight: number = 10;

const armorValue: number = 7;

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
