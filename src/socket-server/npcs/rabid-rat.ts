import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { ArmorType, NpcIds, NPC } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import startCombat from '../../utils/startCombat';

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.RABID_RAT,
    name: "a rabid rat",
    description: "A [rabid rat], chaotic and mad with rage, seethes and thrashes!",
    keywords: ['rabid rat', 'rat'],
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

  npc.getDescription = function (): string { return npc.description; };

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    if (command.match(/^look (?:rat|rabid rat)$/)) {
      emitOthers(`${character.name} looks tentatively at ${npc.name}.`);
  
      const actorText: string[] = [];
      if (npc.health > 0) actorText.push(npc.getDescription(character));
      actorText.push(npcHealthText(npc.name, npc.health, npc.healthMax));
      emitSelf(actorText);
      
      return true;
    }
  
    if (command.match(/^talk (?:rat|rabid rat)$/)) {
      if (npc.health < 1) {
        emitOthers(`${character.name} is talking to a corpse.`);
        emitSelf(`You find that ${npc.name} is not very talkative when they are dead.`);
        return true;
      }
      emitOthers(`${character.name} is trying to chat with ${npc.name}.`);
      emitSelf(`All that ${npc.name} wants to share is its disease.`);
      return true;
    }
  
    if (command.match(/^(?:fight|attack|hit) (?:rat|rabid rat)$/)) {
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