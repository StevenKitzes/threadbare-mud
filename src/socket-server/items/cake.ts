import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_EAT_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { DamageType, ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.CAKE;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a tasty cake";
const description: string = "A freshly baked cake, sweet and covered with little bits of fruit and a sugar glaze.";
const keywords: string[] = ['cake', 'fruit cake', 'tart'];
const value: number = 8;
const weight: number = 1;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, command, socket } = handlerOptions;
  const { name } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  // Handle consumption
  if (
    command.match(makeMatcher(REGEX_EAT_ALIASES, keywords.join('|'))) &&
    character.inventory.includes(id)
  ) {
    const newHealth: number = Math.max(character.health_max, character.health + 30);
    const newInventory: string[] = [ ...character.inventory ];
    newInventory.splice(character.inventory.indexOf(id), 1);
    if (writeCharacterData(character.id, {
      health: newHealth,
      inventory: newInventory
    })) {
      character.health = newHealth;
      character.inventory = newInventory;
      emitOthers(`${name} eats ${title}.`);
      emitSelf(`You enjoy ${title} and feel a little rejuvenated.`);
      return true;
    }
  }
};

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  handleItemCommand
};
