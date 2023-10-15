import getEmitters from "../../utils/emitHelper";
import getRandomHorseName from '../../utils/getRandomHorseName';
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_HORSE_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { ItemIds } from "../items/items";
import { CharacterUpdateOpts, Horse } from "../../types";
import { writeCharacterData } from "../../../sqlite/sqlite";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.STABLEMASTER,
    name: "a stablemaster",
    description: "A [stablemaster] is hard at work, bent over the hoof of a horse he is shoeing.",
    keywords: ['stablemaster', 'groom'],
    regexAliases: 'stablemaster|groom',

    saleItems: [
      items.get(ItemIds.MODEST_SADDLEBAGS),
      items.get(ItemIds.LEATHER_SADDLEBAGS),
      items.get(ItemIds.REINFORCED_SAGGLEBAGS),
    ],

    getDescription: () => '',

    handleNpcCommand: (handlerOptions: HandlerOptions) => { console.error("handleNpcCommand needs implementation."); return false; },
  }

  npc.getDescription = function (): string {
    return npc.description;
  };

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (command.match(makeMatcher(REGEX_LOOK_ALIASES, npc.regexAliases))) {
      return look(emitOthers, emitSelf, npc.getDescription, character, npc.name);
    }
  
    // talk to this npc
    if (command.match(makeMatcher(REGEX_TALK_ALIASES, npc.regexAliases))) {
      emitOthers(`${name} talks with ${npc.name}.`);
      emitSelf([
        `You watch as ${npc.name} nods respectfully at your approach.  He wraps up his current task, then wipes his hands on a dusty rag.  "Welcome, friend.  Got some fine steeds available for purchase, if you've the coin.  They ain't cheap at 1,000 coins, but I'll throw in a [modest saddle] if you ride off on one.  If you just need a saddle, here's what I got."`,
        ...npc.saleItems.map(item => `- ${item.title} (${item.type}) {${item.value} coin${item.value === 1 ? '' : 's'}}`),
        `You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`
      ]);
      return true;
    }
  
    // purchase from this npc
    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch !== null) {
      if (makePurchase(buyMatch, npc.saleItems, character, emitOthers, emitSelf, npc.name)) return true;

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
