import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SIMPLE_DAGGER;
const type: ItemTypes = ItemTypes.lightWeapon;
const damageType: DamageType = DamageType.piercing;
const title: string = "a simple dagger";
const description: string = "A [simple dagger] made of plain steel.  It is about the length of a forearm and has a simple leather wrap around the grip.";
const keywords: string[] = ['simple dagger', 'dagger'];
const value: number = 25;
const weight: number = 2;

// Optional
const damageValue: number = 5;

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
