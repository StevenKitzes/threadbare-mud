import { HandlerOptions } from "../server";

export type Item = {
  id: string;
  type: ItemTypes;
  title: string;
  description: string;
  keywords: string[];
  value: number;
  weight: number;
  armorValue?: number;
  damageValue?: number;
  damageType?: DamageType;
  hitBonus?: number;
  handleItemCommand?: (handlerOptions: HandlerOptions) => boolean;
  quest?: boolean;
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
  lightWeapon = "lightWeapon",
  heavyWeapon = "heavyWeapon",
  rangedWeapon = "rangedWeapon",
  consumable = "consumable"
};

export enum DamageType {
  slashing,
  piercing,
  bashing
}

export enum ItemIds {
  GOOD_LUCK_CHARM = "1",
  BLACK_HEADBAND = "2",
  LOOSE_BLACK_TUNIC = "3",
  LOOSE_BLACK_PANTS = "4",
  SOFT_BLACK_BOOTS = "5",
  SIMPLE_DAGGER = "6",
  AUDRICS_COIN_POUCH = "7",
  SMALL_ANVIL = "8",
  MEDIUM_ANVIL = "9",
  LARGE_ANVIL = "10",
  HUGE_ANVIL = "11",
  COLOSSAL_ANVIL = "12",
  SWEETROLL = "13",
  BREAD_LOAF = "14",
  CAKE = "15",
}

import('./good-luck-charm').then(item => items.set(item.id, item));
import('./black-headband').then(item => items.set(item.id, item));
import('./loose-black-tunic').then(item => items.set(item.id, item));
import('./loose-black-pants').then(item => items.set(item.id, item));
import('./soft-black-boots').then(item => items.set(item.id, item));
import('./simple-dagger').then(item => items.set(item.id, item));
import('./audrics-coin-pouch').then(item => items.set(item.id, item));
import('./small-anvil').then(item => items.set(item.id, item));
import('./medium-anvil').then(item => items.set(item.id, item));
import('./large-anvil').then(item => items.set(item.id, item));
import('./huge-anvil').then(item => items.set(item.id, item));
import('./colossal-anvil').then(item => items.set(item.id, item));
import('./sweetroll').then(item => items.set(item.id, item));
import('./bread-loaf').then(item => items.set(item.id, item));
import('./cake').then(item => items.set(item.id, item));

export default items;
