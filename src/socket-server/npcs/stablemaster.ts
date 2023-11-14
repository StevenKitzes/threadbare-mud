import getEmitters from "../../utils/emitHelper";
import getRandomHorseName from '../../utils/getRandomHorseName';
import { HandlerOptions } from "../server";
import { NPC } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_HORSE_ALIASES } from "../../constants";
import { ItemIds } from "../items/items";
import { CharacterUpdateOpts, Horse } from "../../types";
import { writeCharacterData } from "../../../sqlite/sqlite";

export function augment_stablemaster(npc: NPC): NPC {
  npc.handleNpcCustom = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // purchase horse
    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch === null) return false;

    // player wants to buy a horse?
    if (buyMatch.match(makeMatcher(REGEX_HORSE_ALIASES))) {
      if (character.horse !== null) {
        emitOthers(`${name} tried to buy a new horse, but ${character.horse.name} was jealous.`);
        emitSelf(`You already have ${character.horse.name}, they would be jealous.`);
        return true;
      }

      if (character.money >= 1000) {
        const newHorse: Horse = {
          name: getRandomHorseName(),
          inventory: [],
          saddlebagsId: ItemIds.MODEST_SADDLEBAGS
        };
        const characterUpdate: CharacterUpdateOpts = {
          horse: newHorse,
          money: character.money - 1000
        }
        if (writeCharacterData(handlerOptions, characterUpdate)) {
          emitOthers(`${name} is the proud new owner of ${newHorse.name} the horse.`);
          emitSelf(`You are the proud new owner of ${newHorse.name} the horse!  You can [look] at your new horse to learn more about them and what you can do with them.`);
          return true;
        }
      } else {
        emitOthers(`${name} tries to negotiate the purchase of a new horse, but can't afford it.`);
        emitSelf(`You can't afford a new horse right now.`);
        return true;
      }
    }
  
    return false;
  }

  return npc;
}
