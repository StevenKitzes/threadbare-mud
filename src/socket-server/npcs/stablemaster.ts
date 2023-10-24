import getEmitters from "../../utils/emitHelper";
import getRandomHorseName from '../../utils/getRandomHorseName';
import { HandlerOptions } from "../server";
import { NPC, look, makePurchase } from "./npcs";
import { captureFrom, commandMatchesKeywordsFor, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_HORSE_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { Item, ItemIds } from "../items/items";
import { CharacterUpdateOpts, Horse } from "../../types";
import { writeCharacterData } from "../../../sqlite/sqlite";

export function augment_stablemaster(npc: NPC): NPC {
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
        .map(item => `- ${item.title} (${item.type}) {${item.value} coin${item.value === 1 ? '' : 's'}}`));
        actorText.push(`You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`);
      }
      
      emitOthers(`${name} talks with ${npc.getName()}.`);
      emitSelf(actorText);
      return true;
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
  
    // purchase horse
    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch !== null) {
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
          if (writeCharacterData(character.id, characterUpdate)) {
            Object.keys(characterUpdate).forEach(key => character[key] = characterUpdate[key]);
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
    }
  
    return false;
  }

  return npc;
}
