import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look } from "./npcs";
import { writeCharacterData } from "../../../sqlite/sqlite";
import { ItemIds } from "../items/items";
import { Character, CharacterUpdateOpts } from "../../types";
import { makeMatcher } from "../../utils/makeMatcher";
import { REGEX_FIGHT_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { SceneIds } from "../scenes/scenes";
import { NpcImport, npcImports } from "./csvNpcImport";

const id: NpcIds = NpcIds.AUDRIC;
const csvData: NpcImport = npcImports.get(id);

export function make(): NPC {
  const npc: NPC = {
    id,
    name: csvData.name,
    description: "[Audric] wears elaborate robes in colored brocade, jewelry of all kinds, and an embroidered cap.  He has long white hair, a long white beard, shining eyes and a quick smile.",
    keywords: ['audric', 'man', 'old man'],
    regexAliases: 'audric|man|old man|wizard|mage',

    getDescription: () => '',

    handleNpcCommand: (handlerOptions: HandlerOptions) => { console.error("handleNpcCommand needs implementation."); return false; },
  }

  npc.getDescription = function (character: Character): string {
    if ( character.stories.main === 1 && character.scene_id === SceneIds.MAGNIFICENT_LIBRARY )
      return "Sitting in the library with a mischievous smirk on his face is an [old man] with long white hair and a full, white beard.  He is wearing elaborate robes of fine brocade, and a delicately embroidered cap.  Rich-looking jewelry studs his fingers, adorns his wrists, and dangles from his neck.  He looks like he wants to talk.";
    if ( character.stories.main === 2 && character.scene_id === SceneIds.MAGNIFICENT_LIBRARY )
      return `[Audric] sits on a luxurious couch, with his hands folded over his lap and a pleasant smile on his face.  "I look forward to seeing the traveling supplies you return with!"`;
    return npc.description;
  }

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (command.match(makeMatcher(REGEX_LOOK_ALIASES, npc.regexAliases))) {
      return look(emitOthers, emitSelf, npc.getDescription, character, npc.name);
    }
  
    // talk to this npc
    if (command.match(makeMatcher(REGEX_TALK_ALIASES, npc.regexAliases))) {
      if (character.stories.main === 1 && character.scene_id === SceneIds.MAGNIFICENT_LIBRARY) {
        let characterUpdate: CharacterUpdateOpts = {};
        characterUpdate.stories = { ...character.stories, main: 2 };
        characterUpdate.inventory = [ ...character.inventory, ItemIds.AUDRICS_COIN_POUCH ];
    
        if (writeCharacterData(character.id, characterUpdate)) {
          Object.keys(characterUpdate).forEach(key => character[key] = characterUpdate[key]);
          const actorText: string[] = [];
          actorText.push(`"Welcome, my friend!"  The old man rises to greet you.  "You must be wondering why you are here.  First of all, my name is [Audric], and it is a pleasure, I'm sure!  You are a guest in my home, in the city of Parliament, capital of the Realm of Ixpanne.  You would surely like to know more about how you've come to be here, but I'm afraid I must ask something in return.  I'd like you to run an errand for me in town.  Would you go to the shop and purchase some traveling supplies?  On my coin, of course!"`);
          actorText.push(`He hands you a coin pouch and gestures toward the [staircase] leading out of the library.  "I look forward to your success!"`);
          emitOthers(`${character.name} has a quiet conversation with Audric.`);
          emitSelf(actorText);
          return true;
        }
      }

      if (character.stories.main === 2 && character.scene_id === SceneIds.MAGNIFICENT_LIBRARY) {
        emitOthers(`${character.name} has a quiet conversation with Audric.`);
        emitSelf("Audric greets you warmly and continues to wait patiently for you to return with traveling supplies.");
        return true;
      }

      emitOthers(`${character.name} talks with ${npc.name}.`);
      emitSelf(`${npc.name} engages you in lively (but vapid) conversation.  His smile suggests he is more intelligent than he lets on, but also that he expects - maybe even desires for you to see through him.`);
      return true;
    }
  
    // fight this npc
    if (command.match(makeMatcher(REGEX_FIGHT_ALIASES, npc.regexAliases))) {
      emitOthers(`${character.name} looks about to try and fight ${npc.name}, but thinks better of it.`);
      emitSelf(`You get a very strong feeling it would be a bad idea to try and fight ${npc.name}.`);
      return true;
    }
  
    return false;
  }

  return npc;
}
