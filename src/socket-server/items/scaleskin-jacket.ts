import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.SCALESKIN_JACKET;
const type: ItemTypes = ItemTypes.armor;
const title: string = 'Scaleskin Jacket';
const description: string = "A leather [Scaleskin Jacket], taking its name from the embossed reptile scale pattern over its surface.  It is said to grant more protection to the wearer than just the leather normally would.";
const keywords: string[] = ['jacket', 'scaleskin jacket', 'magic jacket', 'leather jacket'];
const value: number = 1500;
const weight: number = 10;

const armorValue: number = 12;
const statEffects: StatEffect[] = [{
  stat: EffectStat.armor,
  amount: 1
}];

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  armorValue,
  statEffects
};
