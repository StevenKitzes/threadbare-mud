import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_FIGHT_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { CharacterUpdateOpts } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { commandMatchesKeywordsFor } from "../../utils/makeMatcher";
import { ItemIds } from "../items/items";
import { SceneIds } from "../scenes/scenes";
import { HandlerOptions } from "../server";
import { NPC, look } from "./npcs";

export function augment_audric (npc: NPC): NPC {
  npc.getDescription = function (): string {
    if (
      npc.private.characterRef.stories.main === 1 &&
      npc.private.characterRef.scene_id === SceneIds.MAGNIFICENT_LIBRARY
    ) {
      return "Sitting in the library with a mischievous smirk on his face is an [old man] with long white hair and a full, white beard.  He is wearing elaborate robes of fine brocade, and a delicately embroidered cap.  Rich-looking jewelry studs his fingers, adorns his wrists, and dangles from his neck.  He looks like he wants to talk.";
    }

    if (
      npc.private.characterRef.stories.main === 2 &&
      npc.private.characterRef.scene_id === SceneIds.MAGNIFICENT_LIBRARY
    ) {
      return `[Audric] sits on a luxurious couch, with his hands folded over his lap and a pleasant smile on his face.  "I look forward to seeing the traveling supplies you return with!"`;
    }

    return npc.getDescription();
  }

  npc.getName = function (): string {
    if ( npc.private.characterRef.stories.main === 1 ) {
      return "an old man";
    } else {
      return "Audric";
    }
  }

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (look(command, emitOthers, emitSelf, npc, character)) return true;
  
    // talk to Audric, this can move the story
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_TALK_ALIASES)) {
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

      emitOthers(`${character.name} talks with ${npc.getName()}.`);
      emitSelf(`${npc.getName()} engages you in lively (but vapid) conversation.  His smile suggests he is more intelligent than he lets on, but also that he expects - maybe even desires for you to see through him.`);
      return true;
    }
  
    // fight this npc
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_FIGHT_ALIASES)) {
      emitOthers(`${character.name} looks about ready to try and fight ${npc.getName()}, but thinks better of it.`);
      emitSelf(`You get a very strong feeling it would be a bad idea to try and fight ${npc.getName()}.`);
      return true;
    }
  
    return false;
  }

  return npc;
}
