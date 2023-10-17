/* Use this template to create new items

import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.;
const type: ItemTypes = ItemTypes.;
const title: string = ;
const description: string = ;
const keywords: string[] = ;
const value: number = ;
const weight: number = ;

const armorValue: number = ;
const damageValue: number = ;
const damageType: DamageType = ;
const hitBonus: number = ;
const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
};
const quest: boolean = ;
const healAmount: number = ;

const statEffects: StatEffect[] = ;

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
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
