import getEmitters from "../../utils/emitHelper";
import getRandomHorseName from '../../utils/getRandomHorseName';
import { HandlerOptions } from "../server";
import { csvNpcToKeywords } from "../../utils/csvPropsToKeywords";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_HORSE_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { Item, ItemIds } from "../items/items";
import { CharacterUpdateOpts, Horse } from "../../types";
import { writeCharacterData } from "../../../sqlite/sqlite";
import { NpcImport, npcImports } from "./csvNpcImport";

const id: NpcIds = NpcIds.STABLEMASTER;
const csvData: NpcImport = npcImports.get(id);

export function make(): NPC {
  const npc: NPC = {
    id,
    name: csvData.name,
    description: "",
    keywords: csvNpcToKeywords(csvData),


    saleItems: [
      items.get(
      items.get(
      items.get(
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
        ``,
        ...npc.saleItems.map(item => `- ${item.title} (${item.type}) {${item.value} coin${item.value === 1 ? '' : 's'}}`),
        `You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`
      ]);
      return true;
    }
  
    // look at an item this npc has for sale
    for(let i = 0; i < npc.saleItems.length; i++) {
      const currentItem: Item = npc.saleItems[i];
      if (command.match(makeMatcher(REGEX_LOOK_ALIASES, currentItem.keywords.join('|')))) {
        emitOthers(`${name} inspects ${currentItem.title} that ${npc.name} has for sale.`);
        emitSelf(currentItem.description);
        return true;
      }
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
