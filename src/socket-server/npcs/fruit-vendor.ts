import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { firstCharToUpper } from "../../utils/firstCharToUpper";
import { writeCharacterData } from "../../../sqlite/sqlite";
import items, { Item, ItemIds } from "../items/items";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.FRUIT_VENDOR,
    name: "a fruit vendor",
    description: "A gentle fellow with a kind demeanor, this [fruit vendor] has quite an assortment, ready for you to enjoy!",
    keywords: ['fruit vendor', 'fruit seller', 'fruit merchant'],
    regexAliases: 'fruit vendor|fruit seller|fruit merchant',
    attackDescription: 'drive-by fruiting',

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
      emitSelf([
        `${firstCharToUpper(npc.name)} is almost bouncing with joy over his little produce cart.  He holds up one fruit, then another, eager for you to try them all.  "Try an [apple], just 3 coins!  Or how about an [orange], only 4 coins!  Maybe you'd prefer a [plum] for a steal at 3 coins?  Or even..."  He whispers conspiratorily.  "An [avocado]?  I can let them go for 8 coins!"`,
        `You currently have ${character.money} coins.`
      ]);
      return true;
    }
  
    // purchase from this npc
    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch !== null) {
      if (['apple', 'orange', 'plum', 'avocado'].includes(buyMatch)) {
        let itemId: string;
        switch (buyMatch) {
          case 'apple': itemId = ItemIds.APPLE; break;
          case 'orange': itemId = ItemIds.ORANGE; break;
          case 'plum': itemId = ItemIds.PLUM; break;
          case 'avocado': itemId = ItemIds.AVOCADO; break;
        }
        const item: Item = items.get(itemId);

        if (character.money >= item.value) {
          const newInventory: string[] = [ ...character.inventory, item.id ];
          if (writeCharacterData(character.id, {
            money: character.money - item.value,
            inventory: newInventory
          })) {
            character.money -= item.value;
            character.inventory.push(item.id);
            emitOthers(`${name} buys ${item.title} from ${npc.name}.`);
            emitSelf(`You buy ${item.title} from ${npc.name}`);
          }
        } else {
          emitOthers(`${name} tries to buy ${item.title} from ${npc.name}, but can't afford it.`);
          emitSelf(`You can't afford to buy ${item.title}.`);
          return true;
        }
      }
    }
  
    return false;
  }

  return npc;
}
