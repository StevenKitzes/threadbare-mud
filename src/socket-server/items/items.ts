import { HandlerOptions } from "../server";

export type Item = {
  id: string;
  type: ItemTypes;
  title: string;
  description: string;
  keywords: string[];
  value: number;
  armorValue?: number;
  damageValue?: number;
  hitBonus?: number;
  handleItemCommand?: (handlerOptions: HandlerOptions) => boolean;
};

export const items: Map<string, Item> = new Map<string, Item>();

export enum ItemTypes {
  trinket = "trinket",
  headgear = "headgear",
  armor = "armor",
  gloves = "gloves",
  legwear = "legwear",
  footwear = "footwear",
  offhand = "offhand",
  weapon = "weapon"
};

export enum ItemIds {
  GOOD_LUCK_CHARM = "1",
  BLACK_HEADBAND = "2",
  LOOSE_BLACK_TUNIC = "3",
  LOOSE_BLACK_PANTS = "4",
  SOFT_BLACK_BOOTS = "5",
  SIMPLE_DAGGER = "6",
}

import('./good-luck-charm').then(item => items.set(item.id, item));
import('./black-headband').then(item => items.set(item.id, item));
import('./loose-black-tunic').then(item => items.set(item.id, item));
import('./loose-black-pants').then(item => items.set(item.id, item));
import('./soft-black-boots').then(item => items.set(item.id, item));
import('./simple-dagger').then(item => items.set(item.id, item));

export default items;
