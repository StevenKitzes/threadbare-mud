import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import startCombat from '../../utils/combat';
import { makeMatcher } from "../../utils/makeMatcher";
import { REGEX_FIGHT_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { ClassTypes, Faction } from "../../types";
import { firstCharToUpper } from "../../utils/firstCharToUpper";
import { ItemIds } from "../items/items";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.SCOWLING_PEACEKEEPER,
    name: "a scowling peacekeeper",
    description: "A [scowling peacekeeper], city guard of Parliament, stalks about on his rounds.  He scowls at everyone around him.",
    keywords: ['scowling peacekeeper', 'peacekeeper', 'guard', 'city guard'],
    regexAliases: 'peacekeeper|scowling peacekeeper|guard|city guard',
    
    faction: Faction.PARLIAMENT_PEACEKEEPER,
    attackDescription: "a peacekeeper's longsword",
    cashLoot: 5,
    itemLoot: [ItemIds.PEACEKEEPER_LONGSWORD],
    xp: 5,
    healthMax: 100,
    agility: 10,
    strength: 12,
    savvy: 8,
    damageValue: 15,
    armor: 12,
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
      return `The body of ${npc.name} lies lifeless on the ground, scowling no more.`;
    } else {
      return `${npc.description}  ${npcHealthText(npc.name, npc.health, npc.healthMax)}`;
    }
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
      if (npc.health < 1) {
        emitOthers(`${character.name} is talking to a corpse.`);
        emitSelf(`You find that ${npc.name} is not very talkative when they are dead.`);
        return true;
      }
      emitOthers(`${name} is trying to talk to ${npc.name}.`);
      switch (character.job) {
        case ClassTypes.peacemaker:
          emitSelf(`Even before you speak, ${npc.name} is quick with his sharp tongue.  "Keep out of trouble, gray one."`);
          break;
        case ClassTypes.ranger:
          emitSelf(`"Stay safe, citizen."  ${firstCharToUpper(npc.name)} nods and moves on with his rounds.`);
          break;
        case ClassTypes.rogue:
          emitSelf(`${firstCharToUpper(npc.name)} eyes you suspiciously.  "Stay out of trouble, citizen."`);
          break;
        case ClassTypes.skyguard:
          emitSelf(`"No loitering, skin-job!"  ${firstCharToUpper(npc.name)} scowls at your bristling furry patches.`);
          break;
        case ClassTypes.spymaster:
          emitSelf(`You get a respectful nod from ${npc.name}.  "Stay safe, citizen."`);
          break;
        case ClassTypes.weaver:
          emitSelf(`You get a curious glance from ${npc.name}.  "Long way from home, Weaver?"`);
          break;
      }
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
