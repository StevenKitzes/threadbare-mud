import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NPC, look, makePurchase } from "./npcs";
import { commandMatchesKeywordsFor, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_LOOK_ALIASES, REGEX_REST_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { Item } from "../items/items";
import { CharacterUpdateOpts } from "../../types";
import { writeCharacterData } from "../../../sqlite/sqlite";

export function augment_gruffInnkeeper(npc: NPC): NPC {
  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (look(command, emitOthers, emitSelf, npc, character)) return true;
  
    // talk to this npc
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_TALK_ALIASES)) {
      const actorText: string[] = [npc.getTalkText()];
      
      // In case of mercantile activity
      if (npc.getSaleItems() !== undefined) {
        actorText.push(...npc.getSaleItems()
        .map(item => `- ${item.title} (${item.type}) {${item.getValue()} coin${item.getValue() === 1 ? '' : 's'}}`));
        actorText.push(`You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`);
      }
      
      emitOthers(`${name} talks with ${npc.getName()}.`);
      emitSelf(actorText);
      return true;
    }

    // handle resting here
    if (command.match(makeMatcher(REGEX_REST_ALIASES))) {
      const characterUpdate: CharacterUpdateOpts = {};
      characterUpdate.money = character.money - 20;
      characterUpdate.health = character.health_max;
      characterUpdate.checkpoint_id = character.scene_id;
      if (character.money >= 20) {
        if (writeCharacterData(character.id, characterUpdate)) {
          Object.keys(characterUpdate).forEach(key => character[key] = characterUpdate[key]);
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
  
    // look at an item this npc has for sale
    if (npc.getSaleItems() !== undefined) {
      for(let i = 0; i < npc.getSaleItems().length; i++) {
        const currentItem: Item = npc.getSaleItems()[i];
        if (commandMatchesKeywordsFor(command, currentItem.keywords, REGEX_LOOK_ALIASES)) {
          emitOthers(`${name} inspects ${currentItem.title} that ${npc.getName()} has for sale.`);
          emitSelf(currentItem.description);
          return true;
        }
      }
    }
  
    // purchase from this npc
    if (makePurchase(command, npc, character, emitOthers, emitSelf)) return true;
  
    return false;
  }

  return npc;
}
