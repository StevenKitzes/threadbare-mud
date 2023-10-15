import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PADDED_LEATHER_ARMOR;
const type: ItemTypes = ItemTypes.armor;
const title: string = "padded leather armor";
const description: string = "This [padded leather armor] provides a very basic level of protection from harm to the wearer.  It is a little bulky and awkward, made of tough leather panels over a heavy cloth backing; but it's better than nothing if you expect to get into a scrap.";
const keywords: string[] = ['padded leather armor', 'leather armor', 'padded armor'];
const value: number = 65;
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
