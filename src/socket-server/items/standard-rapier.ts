import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.STANDARD_RAPIER;
const type: ItemTypes = ItemTypes.lightWeapon;
const damageType: DamageType = DamageType.piercing;
const title: string = "a standard rapier";
const description: string = "A [standard rapier], suitable for duels and light combat.  It has a sharp tip and a flexible blade.";
const keywords: string[] = ['standard rapier', 'rapier'];
const value: number = 120;
const weight: number = 3;

// Optional
const damageValue: number = 20;

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
