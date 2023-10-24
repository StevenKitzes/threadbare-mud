import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { csvNpcToKeywords } from "../../utils/csvPropsToKeywords";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_REST_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { Item, ItemIds } from "../items/items";
import { CharacterUpdateOpts } from "../../types";
import { writeCharacterData } from "../../../sqlite/sqlite";
import { NpcImport, npcImports } from "./csvNpcImport";

const id: NpcIds = NpcIds.GRUFF_INNKEEPER;
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

    // handle resting here
    if (command.match(makeMatcher(REGEX_REST_ALIASES))) {
      const characterUpdate: CharacterUpdateOpts = {};
      characterUpdate.money = character.money - 20;
      characterUpdate.health = character.health_max;
      characterUpdate.checkpoint_id = character.scene_id;
      if (character.money >= 20) {
        if (writeCharacterData(character.id, characterUpdate)) {
          Object.keys(characterUpdate).forEach(key => character[key] = characterUpdate[key]);
          emitOthers(`${name} hands ${npc.name} some coin and heads upstairs to rest for the night.`);
          emitSelf(`You hand some coin to ${npc.name} and head upstairs to rest for the night.`);
          return true;
        }
      } else {
        emitOthers(`${name} tries to rent a room from ${npc.name}, but can't afford it.`);
        emitSelf(`"Sorry, friend.  No coin, no room.  It's 20 coins to spend the night, and you only have ${character.money}."`);
        return true;
      }
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
    }
  
    return false;
  }

  return npc;
}
