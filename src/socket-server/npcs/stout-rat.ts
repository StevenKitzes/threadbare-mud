import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look, ArmorType } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import startCombat from '../../utils/combat';
import { makeMatcher } from "../../utils/makeMatcher";
import { REGEX_FIGHT_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { NpcImport, npcImports } from "./csvNpcImport";

const id: NpcIds = NpcIds.STOUT_RAT;
const csvData: NpcImport = npcImports.get(id);

export function make(): NPC {
  const npc: NPC = {
    id,
    name: csvData.name,
    description: "This [stout rat] looks a little more resiliant than your average rodent, but may have paid for it in intelligence.",
    keywords: ['stout rat', 'rat'],
    regexAliases: 'stout rat|rat|rodent',
    attackDescription: "stout little teeth",

    cashLoot: 0,
    itemLoot: [],
    xp: csvData.cashLoot,
    healthMax: csvData.healthMax,
    agility: csvData.agility,
    strength: csvData.strength,
    savvy: csvData.savvy,
    damageValue: csvData.damageValue,
    armor: csvData.armor,
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
    if (npc.health < 1) {
      return "A dead rat lies here, stout though it may once have been.";
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
      emitOthers(`You aren't quite sure why ${character.name} is trying to talk to ${npc.name}.`);
      emitSelf(`You find conversation with ${npc.name} to be quite uninteresting.`);
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
