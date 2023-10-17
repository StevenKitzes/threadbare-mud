import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.LITTLE_THROWING_DAGGERS;
const type: ItemTypes = ItemTypes.rangedWeapon;
const damageType: DamageType = DamageType.piercing;
const title: string = "little throwing daggers";
const description: string = "A simple, but effective, set of [little throwing daggers] for the deft of hand.  They are made of plain steel, tip to butt.";
const keywords: string[] = ['little throwing daggers', 'little daggers', 'throwing daggers'];
const value: number = 100;
const weight: number = 4;

// Optional
const damageValue: number = 10;

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
