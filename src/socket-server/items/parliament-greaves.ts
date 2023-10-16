import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PARLIAMENT_GREAVES;
const type: ItemTypes = ItemTypes.legwear;
const title: string = "a set of Parliamentary greaves";
const description: string = "A fine set of [polished plate greaves] to protect the legs, etched with the livery of the Realm of Ixpanne.";
const keywords: string[] = ['polished plate greaves', 'plate greaves', 'polished greaves'];
const value: number = 2500;
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
