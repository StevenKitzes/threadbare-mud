import { EffectStat, StatEffect } from "../../types";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.INSPIRING_SILVER_SCEPTER;
const type: ItemTypes = ItemTypes.offhand;
const title: string = "an inspiring silver scepter";
const description: string = "An inspiring [silver scepter], about the length of your arm and covered with ornate etchings.  Carrying such a thing would add to the owner's air of authority.";
const keywords: string[] = ['scepter', 'silver scepter', 'inspiring scepter', 'inspiring silver scepter'];
const value: number = 500;
const weight: number = 5;

const statEffects: StatEffect[] = [{
  stat: EffectStat.savvy,
  amount: 2
}];

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  statEffects
};
