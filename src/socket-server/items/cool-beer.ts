import { REGEX_DRINK_ALIASES } from "../../constants";
import { EffectStat, TemporaryEffect } from "../../types";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.BOTTLE_OF_BEER;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a bottle of beer";
const description: string = "A decent bottle of [beer], kept corked in a brown bottle for travel.";
const keywords: string[] = ['beer', 'beer bottle', 'bottle of beer'];
const value: number = 5;
const weight: number = 1;
const healAmount: number = 10;
const consumeEffects: TemporaryEffect[] = [
  {
    amount: -2,
    duration: 300000,
    name: "the mental affects of alcohol",
    stat: EffectStat.savvy
  },
  {
    amount: -2,
    duration: 600000,
    name: "the physical affects of alcohol",
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
