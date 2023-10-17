import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PEACEKEEPER_LONGSWORD;
const type: ItemTypes = ItemTypes.lightWeapon;
const title: string = "a Parliamentary peacekeeper's longsword";
const description: string = "A [peacekeeper longsword] lies here, unremarkable but for the crest of Parliament engraved upon the hilt.";
const keywords: string[] = ['peacekeeper longsword', 'longsword', 'sword'];
const value: number = 90;
const weight: number = 3;

const damageValue: number = 10;
const damageType: DamageType = DamageType.slashing;

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
