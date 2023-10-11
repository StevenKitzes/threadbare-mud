import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { ArmorType, NpcIds, NPC } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import startCombat from '../../utils/startCombat';

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.SMALL_RAT,
    name: "a small rat",
    description: "A [small rat] with grey-brown fur and beady little eyes scurries about.",
    keywords: ['rat', 'small rat'],

    cashLoot: 0,
    itemLoot: [],
    healthMax: 5,
    agility: 14,
    strength: 2,
    savvy: 6,
    damageValue: 3,
    armor: 1,
    armorType: [],
    
    health: 5,
    deathTime: 0,
    combatInterval: null,

    setHealth: (h: number) => {},
    setDeathTime: (d: number) => {},
    setCombatInterval: (c: NodeJS.Timeout | null) => {},

    handleNpcCommand: (handlerOptions: HandlerOptions) => { console.error("handleNpcCommand needs implementation."); return false; },
  }

  npc.setHealth = function (h: number): void { npc.health = h; }
  npc.setDeathTime = function (d: number): void { npc.deathTime = d; }
  npc.setCombatInterval = function (c: NodeJS.Timeout | null): void { npc.combatInterval = c; }

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    if (command.match(/^look (?:rat|small rat)$/)) {
      emitOthers(`${character.name} eyes ${npc.name} suspiciously.`);
  
      const actorText: string[] = [];
      if (npc.health > 0) actorText.push(npc.description);
      actorText.push(npcHealthText(npc.name, npc.health, npc.healthMax));
      emitSelf(actorText);
      
      return true;
    }
  
    if (command.match(/^talk (?:rat|small rat)$/)) {
      if (npc.health < 1) {
        emitOthers(`${character.name} is talking to a corpse.`);
        emitSelf(`You find that ${npc.name} is not very talkative when they are dead.`);
        return true;
      }
      emitOthers(`${character.name} is trying to have a conversation with a rat.`);
      emitSelf("After several tries, you determine that rats can't talk.  At least, this one can't.");
      return true;
    }
  
    if (command.match(/^(?:fight|attack|hit) (?:rat|small rat)$/)) {
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
