import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_EAT_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.AVOCADO;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "an avocado";
const description: string = "A rare delicacy, this avocado is ripe and just the right texture.";
const keywords: string[] = ['avocado', 'ripe avocado'];
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
    const newHealth: number = Math.max(character.health_max, character.health + 15);
    const newInventory: string[] = [ ...character.inventory ];
    newInventory.splice(character.inventory.indexOf(id), 1);
    if (writeCharacterData(character.id, {
      health: newHealth,
      inventory: newInventory
    })) {
      character.health = newHealth;
      character.inventory = newInventory;
      emitOthers(`${name} eats ${title}.`);
      emitSelf(`You enjoy ${title} and feel rejuvenated.`);
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
