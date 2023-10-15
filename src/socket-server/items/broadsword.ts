import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.BROADSWORD;
const type: ItemTypes = ItemTypes.heavyWeapon;
const damageType: DamageType = DamageType.slashing;
const title: string = "a standard broadsword";
const description: string = "A standard [broadsword], suitable for typical combat conditions.  It is sharp, and seems sturdy enough.";
const keywords: string[] = ['broadsword', 'sword'];
const value: number = 150;
const weight: number = 4;

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
