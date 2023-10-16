import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PARLIAMENT_ARMOR;
const type: ItemTypes = ItemTypes.armor;
const title: string = "Parliamentary upper armor with attached cape";
const description: string = "A gleaming set of [polished plate armor] with a cape and tabard depicting the crest of the Realm of Ixpanne, in the appropriate colors of blue, gold, and purple.  It looks to offer good protection, but might not be up to the standards of a war-hardened soldier.";
const keywords: string[] = ['polished plate armor', 'polished armor', 'polished plate'];
const value: number = 3000;
const weight: number = 25;

const armorValue: number = 25;

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
