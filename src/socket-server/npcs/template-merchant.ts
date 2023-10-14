/* Use this template to create new merchants

import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { writeCharacterData } from "../../../sqlite/sqlite";
import items, { Item, ItemIds } from "../items/items";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.,
    name: ,
    description: ,
    keywords: ,
    regexAliases: ,

    saleItems: ,

    getDescription: () => '',

    handleNpcCommand: (handlerOptions: HandlerOptions) => { console.error("handleNpcCommand needs implementation."); return false; },
  }

  npc.getDescription = function (): string {
    return npc.description;
  };

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name, scene_id: sceneId } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (command.match(makeMatcher(REGEX_LOOK_ALIASES, npc.regexAliases))) {
      return look(emitOthers, emitSelf, npc.getDescription, character, npc.name);
    }
  
    // talk to this npc
    if (command.match(makeMatcher(REGEX_TALK_ALIASES, npc.regexAliases))) {
      emitOthers(`${name} talks with ${npc.name}.`);
      emitSelf([
        -,
        ...npc.saleItems.map(item => `- ${item.title} (${item.type}) {${item.value} coin${item.value === 1 ? '' : 's'}}`),
        `You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`
      ]);
      return true;
    }
  
    // purchase from this npc
    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch !== null) {
      const item: Item | undefined =
        npc.saleItems.find((saleItem: Item) => buyMatch.match(makeMatcher(saleItem.keywords.join('|'))));

      if (item !== undefined) {
        if (character.money >= item.value) {
          const newInventory: string[] = [ ...character.inventory, item.id ];
          if (writeCharacterData(character.id, {
            money: character.money - item.value,
            inventory: newInventory
          })) {
            character.money -= item.value;
            character.inventory.push(item.id);
            emitOthers(`${name} buys ${item.title} from ${npc.name}.`);
            emitSelf(`You buy ${item.title} from ${npc.name}.`);
          }
        } else {
          emitOthers(`${name} tries to buy ${item.title} from ${npc.name} but can't afford it.`);
          emitSelf(`You cannot afford to buy ${item.title}.`);
          return true;
        }
      }
    }
  
    return false;
  }

  return npc;
}

*/
