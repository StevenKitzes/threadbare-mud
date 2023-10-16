import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_DRINK_ALIASES } from "../../constants";
import { CharacterUpdateOpts } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.HEAVY_ATTACK_POTION;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "a dull, gray sludge";
const description: string = "A [dull gray sludge] in an oblong vial, so thick it hardly moves under the cork as you tilt the container.";
const keywords: string[] = ['dull gray sludge', 'dull sludge', 'gray sludge'];
const value: number = 1000;
const weight: number = 2;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, character: {name}, command, socket} = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  if (
    command.match(makeMatcher(REGEX_DRINK_ALIASES, keywords.join("|"))) &&
    character.inventory.includes(id)
  ) {
    if (character.health_max <= 200) {
      emitOthers(`${character.name} takes a long, hard look at ${title}, but thinks better of it.`);
      emitSelf(`Looking into the depths of ${title}, you don't feel your body is strong enough to endure its effects.`);
      return true;
    }

    let characterUpdate: CharacterUpdateOpts = {};
    characterUpdate.health_max = character.health_max - 100;
    characterUpdate.health = Math.min(characterUpdate.health_max, character.health);
    characterUpdate.inventory = [ ...character.inventory ];
    characterUpdate.inventory.splice(character.inventory.indexOf(id), 1);
    characterUpdate.heavy_attack = character.heavy_attack + 1;
    
    if (writeCharacterData(character.id, characterUpdate)) {
      Object.keys(characterUpdate).forEach(key => character[key] = characterUpdate[key]);
      emitOthers(`${name}'s skin glows for a moment and they shudder as they drink ${title}.`);
      emitSelf(`You gulp down ${title} and feel the Lifelight burning you up from the inside out.  When the feeling subsides, you feel your hands are more comfortable swinging heavy weapons.`);
      return true;
    }
  }

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
};
