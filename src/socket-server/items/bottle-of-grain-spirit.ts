import { REGEX_DRINK_ALIASES } from "../../constants";
import { EffectStat, TemporaryEffect } from "../../types";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.BOTTLE_OF_GRAIN_SPIRIT;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a bottle of grain spirit";
const description: string = "A decent bottle of clear [grain spirit], kept corked in a clear bottle for travel.";
const keywords: string[] = ['spirit', 'grain spirit', 'bottle of spirit', 'bottle of grain spirit'];
const value: number = 20;
const weight: number = 2;
const healAmount: number = 5;
const consumeEffects: TemporaryEffect[] = [
  {
    amount: -4,
    duration: 600000,
    name: "the mental affects of grain spirit",
    stat: EffectStat.savvy
  },
  {
    amount: -4,
    duration: 1200000,
    name: "the physical affects of grain spirit",
    stat: EffectStat.agility
  }
];

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  if (consumeItem({
    handlerOptions,
    actionAliases: REGEX_DRINK_ALIASES,
    targetAliases: keywords.join('|'),
    itemId: id,
    itemTitle: title,
    healAmount,
    consumeEffects,
  })) return true;

  return false;
};

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  handleItemCommand,
  healAmount,
  consumeEffects
};
