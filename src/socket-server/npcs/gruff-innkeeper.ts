import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NPC } from "./npcs";
import { makeMatcher } from "../../utils/makeMatcher";
import { REGEX_REST_ALIASES } from "../../constants";
import { CharacterUpdateOpts } from "../../types";
import { writeCharacterData } from "../../../sqlite/sqlite";

export function augment_gruffInnkeeper(npc: NPC): NPC {
  npc.handleNpcCustom = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // handle resting here
    if (command.match(makeMatcher(REGEX_REST_ALIASES))) {
      const characterUpdate: CharacterUpdateOpts = {};
      characterUpdate.money = character.money - 20;
      characterUpdate.health = character.health_max;
      characterUpdate.checkpoint_id = character.scene_id;
      if (character.money >= 20) {
        if (writeCharacterData(character, characterUpdate)) {
          emitOthers(`${name} hands ${npc.getName()} some coin and heads upstairs to rest for the night.`);
          emitSelf(`You hand some coin to ${npc.getName()} and head upstairs to rest for the night.`);
          return true;
        }
      } else {
        emitOthers(`${name} tries to rent a room from ${npc.getName()}, but can't afford it.`);
        emitSelf(`"Sorry, friend.  No coin, no room.  It's 20 coins to spend the night, and you only have ${character.money}."`);
        return true;
      }
    }
  
    return false;
  }

  return npc;
}
