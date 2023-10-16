import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SILVER_DAGGER;
const type: ItemTypes = ItemTypes.lightWeapon;
const title: string = "a shining silver dagger";
const description: string = "A shining, [silver dagger], polished to gleam in the light.  A mark of prestige, while still demonstrating some bite to match any bark.";
const keywords: string[] = ['silver dagger', 'shining dagger', 'shining silver dagger'];
const value: number = 40;
const weight: number = 2;

const damageValue: number = 6;
const damageType: number = DamageType.piercing;

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  damageValue,
  damageType,
};
