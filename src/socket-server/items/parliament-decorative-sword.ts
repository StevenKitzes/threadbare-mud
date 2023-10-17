import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PARLIAMENT_DECORATIVE_SWORD;
const type: ItemTypes = ItemTypes.heavyWeapon;
const damageType: DamageType = DamageType.slashing;
const title: string = "a decorative Parliamentary longsword";
const description: string = "A mirror-polished [decorative longsword], with the crest of the capital city of Parliament engraved into the hilt.  It is combat ready, if only just; more meant for show.";
const keywords: string[] = ['decorative longsword', 'longsword', 'parliamentary longsword'];
const value: number = 1250;
const weight: number = 3;

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
