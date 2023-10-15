import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.STANDARD_MACE;
const type: ItemTypes = ItemTypes.heavyWeapon;
const damageType: DamageType = DamageType.bashing;
const title: string = "a standard mace";
const description: string = "A [standard mace], typical of the sort of thing you would see the town guard carrying around.";
const keywords: string[] = ['standard mace', 'mace'];
const value: number = 120;
const weight: number = 5;

// Optional
const damageValue: number = 25;

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  damageValue,
  damageType
};
