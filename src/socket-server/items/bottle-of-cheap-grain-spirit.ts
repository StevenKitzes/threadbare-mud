import { REGEX_DRINK_ALIASES } from "../../constants";
import { EffectStat, TemporaryEffect } from "../../types";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.BOTTLE_OF_CHEAP_GRAIN_SPIRIT;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A cheap bottle of clear [grain spirit], kept corked in a dirty bottle.";
const keywords: string[] = ['cheap spirit', 'cheap grain spirit'];
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;
const healAmount: number = csvData.healAmount;
const consumeEffects: TemporaryEffect[] = [
  {
    amount: -4,
    duration: 1200000,
    name: "the mental affects of cheap spirit",
    stat: EffectStat.savvy
  },
  {
    amount: -4,
    duration: 1800000,
    name: "the physical affects of cheap spirit",
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

function randomizeValue (): number {
  return value = itemPriceRandomizer(csvData.value);
}

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  randomizeValue,
  weight,
  handleItemCommand,
  healAmount,
  consumeEffects
};
