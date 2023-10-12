/* Use this template to create new merchants

import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import startCombat from '../../utils/startCombat';
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_FIGHT_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { firstCharToUpper } from "../../utils/firstCharToUpper";
import { writeCharacterData } from "../../../sqlite/sqlite";
import { ItemIds } from "../items/items";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.,
    name: ,
    description: ,
    keywords: ,
    regexAliases: ,
    attackDescription: ,

    // these defaults shouldn't need to be changed since merchants won't engage in combat
    cashLoot: 0,
    itemLoot: [],
    xp: 0,
    healthMax: 100,
    agility: 10,
    strength: 10,
    savvy: 10,
    damageValue: 0,
    armor: 0,
    armorType: [],
    aggro: false,
    
    health: 100,
    deathTime: 0,
    combatInterval: null,

    setHealth: (h: number) => {},
    setDeathTime: (d: number) => {},
    setCombatInterval: (c: NodeJS.Timeout | null) => {},

    getDescription: () => '',

    handleNpcCommand: (handlerOptions: HandlerOptions) => { console.error("handleNpcCommand needs implementation."); return false; },
  }

  npc.setHealth = function (h: number): void { npc.health = h; };
  npc.setDeathTime = function (d: number): void { npc.deathTime = d; };
  npc.setCombatInterval = function (c: NodeJS.Timeout | null): void { npc.combatInterval = c; };

  npc.getDescription = function (): string {
    return npc.description;
  };

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name, scene_id: sceneId } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (command.match(makeMatcher(REGEX_LOOK_ALIASES, npc.regexAliases))) {
      emitOthers(`${name} is checking out ${npc.name}'s goods.`);
  
      const actorText: string[] = [];
      if (npc.health > 0) actorText.push(npc.getDescription(character));
      actorText.push(npcHealthText(npc.name, npc.health, npc.healthMax));
      emitSelf(actorText);
      
      return true;
    }
  
    // talk to this npc
    if (command.match(makeMatcher(REGEX_TALK_ALIASES, npc.regexAliases))) {
      emitOthers(`${name} talks with ${npc.name}.`);
      emitSelf(-);
      return true;
    }
  
    // purchase from this npc
    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch !== null) {
      if (.includes(buyMatch)) {
        let price: number;
        let itemId: string;
        if (buyMatch === ) {
          price = ;
          itemId = ItemIds.;
        }

        if (character.money >= price) {
          const newInventory: string[] = [ ...character.inventory, itemId ];
          if (writeCharacterData(character.id, {
            money: character.money - price,
            inventory: newInventory
          })) {
            character.money -= price;
            character.inventory.push(itemId);
            emitOthers(-);
            emitSelf(-);
          }
        } else {
          emitOthers(-);
          emitSelf(-);
          return true;
        }
      }
    }
  
    return false;
  }

  return npc;
}

*/
