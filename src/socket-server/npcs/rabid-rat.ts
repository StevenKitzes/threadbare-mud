import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import startCombat from '../../utils/startCombat';
import { makeMatcher } from "../../utils/makeMatcher";
import { REGEX_FIGHT_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.RABID_RAT,
    name: "a rabid rat",
    description: "A [rabid rat], chaotic and mad with rage, seethes and thrashes!",
    keywords: ['rabid rat', 'rat', 'rodent'],
    regexAliases: 'rabid rat|rat|rodent',
    attackDescription: "rabid teeth",

    cashLoot: 0,
    itemLoot: [],
    xp: 2,
    healthMax: 10,
    agility: 15,
    strength: 3,
    savvy: 2,
    damageValue: 3,
    armor: 1,
    armorType: [],
    aggro: true,
    
    health: 10,
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
    if (npc.health < 1) {
      return "A dead rat lies here, white foam still spilling from its mouth.";
    } else {
      return `${npc.description}  ${npcHealthText(npc.name, npc.health, npc.healthMax)}`;
    }
  };

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (command.match(makeMatcher(REGEX_LOOK_ALIASES, npc.regexAliases))) {
      return look(emitOthers, emitSelf, npc.getDescription, character, npc.name);
    }
  
    // talk to this npc
    if (command.match(makeMatcher(REGEX_TALK_ALIASES, npc.regexAliases))) {
      if (npc.health < 1) {
        emitOthers(`${character.name} is talking to a corpse.`);
        emitSelf(`You find that ${npc.name} is not very talkative when they are dead.`);
        return true;
      }
      emitOthers(`${character.name} is trying to chat with ${npc.name}.`);
      emitSelf(`All that ${npc.name} wants to share is its disease.`);
      return true;
    }
  
    // fight with this npc
    if (command.match(makeMatcher(REGEX_FIGHT_ALIASES, npc.regexAliases))) {
      if (npc.health < 1) {
        emitOthers(`${character.name} is beating the corpse of ${npc.name}.`);
        emitSelf(`It's easy to hit ${npc.name} when they are already dead.`);
        return true;
      }
      if (npc.combatInterval !== null) {
        emitSelf(`You are already fighting ${npc.name}!`);
        return true;
      }
      startCombat(npc, handlerOptions);
      return true;
    }
  
    return false;
  }

  return npc;
}
