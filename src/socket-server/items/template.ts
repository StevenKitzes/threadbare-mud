/* Use this template to create new items

import getEmitters from "../../utils/emitHelper";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { itemPropsToKeywords } from "../../utils/itemPropsToKeywords";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = ;
const keywords: string[] = itemPropsToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const armorValue: number = csvData.armorValue;
const damageValue: number = csvData.damageValue;
const damageType: DamageType = csvData.damageType;
const hitBonus: number = csvData.hitBonus;
const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
};
const quest: boolean = ;
const healAmount: number = csvData.healAmount;

const statEffects: StatEffect[] = ;

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
  armorValue,
  damageValue,
  damageType,
  hitBonus,
  handleItemCommand
  quest,
  healAmount,
  statEffects
};

*/
