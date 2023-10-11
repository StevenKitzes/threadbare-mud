import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { ArmorType, NpcIds, NPC } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import startCombat from '../../utils/startCombat';
import { writeCharacterData } from "../../../sqlite/sqlite";
import { ItemIds } from "../items/items";
import { Character } from "../../types";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.AUDRIC,
    name: "Audric",
    description: "[Audric] wears elaborate robes in colored brocade, jewelry of all kinds, and an embroidered cap.  He has long white hair, a long white beard, shining eyes and a quick smile.",
    keywords: ['audric', 'man', 'old man'],
    attackDescription: "a torrent of magical energy",

    cashLoot: 0,
    itemLoot: [],
    healthMax: 999999,
    agility: 99,
    strength: 99,
    savvy: 99,
    damageValue: 99,
    armor: 99,
    armorType: [ArmorType.strongVsBashing, ArmorType.strongVsPiercing, ArmorType.strongVsSlashing],
    
    health: 999999,
    deathTime: 0,
    combatInterval: null,

    setHealth: (h: number) => {},
    setDeathTime: (d: number) => {},
    setCombatInterval: (c: NodeJS.Timeout | null) => {},

    getDescription: () => '',

    handleNpcCommand: (handlerOptions: HandlerOptions) => { console.error("handleNpcCommand needs implementation."); return false; },
  }

  npc.setHealth = function (h: number): void { npc.health = h; }
  npc.setDeathTime = function (d: number): void { npc.deathTime = d; }
  npc.setCombatInterval = function (c: NodeJS.Timeout | null): void { npc.combatInterval = c; }

  npc.getDescription = function (character: Character): string {
    if (
      character.stories.main === 1
    ) {
      return "Sitting in the library with a mischievous smirk on his face is an [old man] with long white hair and a full, white beard.  He is wearing elaborate robes of fine brocade, and a delicately embroidered cap.  Rich-looking jewelry studs his fingers, adorns his wrists, and dangles from his neck.  He eyes you expectantly.";
    }
    if (
      character.stories.main === 2
    ) {
      return `[Audric] sits on a luxurious couch, with his hands folded over his lap and a pleasant smile on his face.  "I look forward to seeing the traveling supplies you return with!"`;
    }
    return npc.description;
  }

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    if (command.match(/^look (?:audric|man|old man)$/)) {
      emitOthers(`${character.name} gazes at ${npc.name}.`);
  
      const actorText: string[] = [];
      if (npc.health > 0) actorText.push(npc.getDescription(character));
      actorText.push(npcHealthText(npc.name, npc.health, npc.healthMax));
      emitSelf(actorText);
      
      return true;
    }
  
    if (character.stories.main === 1 && command.match(/^talk (?:man|old man|audric)$/)) {
      if (
        writeCharacterData(character.id, {
          stories: { ...character.stories, main: 2 },
          inventory: [ ...character.inventory, ItemIds.AUDRICS_COIN_POUCH ]
        })
        ) {
        const actorText: string[] = [];
        character.stories.main = 2;
        character.inventory.push(ItemIds.AUDRICS_COIN_POUCH);
        actorText.push(`"Welcome, my friend!"  The old man rises to greet you.  "You must be wondering why you are here.  First of all, my name is [Audric], and it is a pleasure, I'm sure!  You are a guest in my home.  You would surely like to know more, but I'm afraid I must ask something in return.  I'd like you to run an errand for me in town.  Would you go to the shop and purchase some traveling supplies?  On my coin, of course!"`);
        actorText.push(`He hands you a coin pouch and gestures toward the [staircase] leading out of the library.  "I look forward to your success!"`);
        emitOthers(`${character.name} has a quiet conversation with Audric.`);
        emitSelf(actorText);
      }
      return true;
    }
  
    if (character.stories.main === 2 && command.match(/^talk (?:man|old man|audric)$/)) {
      emitOthers(`${character.name} has a quiet conversation with Audric.`);
      emitSelf("Audric greets you warmly and continues to wait patiently for you to return with traveling supplies.");
      return true;
    }
    
    if (command.match(/^talk (?:audric|man|old man)$/)) {
      if (npc.health < 1) {
        emitOthers(`${character.name} is talking to a corpse.`);
        emitSelf(`You find that ${npc.name} is not very talkative when they are dead.`);
        return true;
      }
      emitOthers(`${character.name} talks with ${npc.name}.`);
      emitSelf(`${npc.name} engages you in lively (but vapid) conversation.  His smile suggests he is more intelligent than he lets on, but also that he expects - maybe even desires for you to see through him.`);
      return true;
    }
  
    if (command.match(/^(?:fight|attack|hit) (?:audric|man|old man)$/)) {
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
