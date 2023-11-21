import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_TALK_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { commandMatchesKeywordsFor } from "../../utils/makeMatcher";
import { ItemIds } from "../items/items";
import { SceneIds } from "../scenes/scenes";
import { HandlerOptions } from "../server";
import { NPC } from "./npcs";

export function augment_sigga (npc: NPC): NPC {
  npc.getDescription = function (): string {
    if (
      npc.private.characterRef.stories.main < 5 &&
      npc.private.characterRef.scene_id === SceneIds.PARLIAMENT_MARKET_INN
    ) {
      return "Sitting alone at a table in the back of the Market Inn's public space is a [woman] in loose, flowing garb, all cut from a sandy brown fabric.  Gleaming gray eyes peer over wrappings that otherwise cover her face, but you can make out the faint shimmer of iridescent color that would mark her as a Weaver.";
    }

    if (
      npc.private.characterRef.stories.main >= 5 &&
      npc.private.characterRef.scene_id === SceneIds.PARLIAMENT_MARKET_INN
    ) {
      return `[Sigga] lounges alone at a table in the back of the Parliament Market Inn.  Her flowing, sandy brown clothing hangs in such a way that it obscures anything she might not want you to perceive.  Her skin betrays her Weaver descent with an iridescent swirl, and cold, gray eyes tell you all you need to know about her interest in social pursuits.`;
    }

    return `[Sigga] is here, wrapped in her billowing, sandy brown robes.`;
  }

  npc.getName = function (): string {
    if ( npc.private.characterRef.stories.main === 1 ) {
      return "a woman";
    } else {
      return "Sigga";
    }
  }

  npc.handleNpcTalk = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // talk to Sigga, this can move the story
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_TALK_ALIASES)) {
      if (character.stories.main < 4 && character.scene_id === SceneIds.PARLIAMENT_MARKET_INN) {
        emitOthers(`${name} tries, without success, to start a conversation with a mysterious woman in a back corner of the room.`);
        emitSelf(`You attempt to speak to the mysterious woman, but she only stares up at you with icy, gray eyes.`);
        return true;
      }

      if (
        character.stories.main === 4 &&
        character.scene_id === SceneIds.PARLIAMENT_MARKET_INN &&
        character.gloves !== ItemIds.AUDRICS_SIGNET
      ) {
        emitOthers(`${character.name} approaches a mysterious woman in a back corner of the room, but she ignores them.`);
        emitSelf(`You approach the mysterious woman at the back of the room.  She glances at your hand, then up at you, then looks away, ignoring you.`);
        return true;
      }

      if (
        character.stories.main === 4 &&
        character.scene_id === SceneIds.PARLIAMENT_MARKET_INN &&
        character.gloves === ItemIds.AUDRICS_SIGNET
      ) {
        if (writeCharacterData(handlerOptions, {
          inventory: [ ...character.inventory, ItemIds.MYSTERIOUS_TOKEN, ItemIds.MYSTERIOUS_TOKEN, ItemIds.MYSTERIOUS_TOKEN, ItemIds.MYSTERIOUS_TOKEN, ItemIds.CRIME_SCENE_LIST ],
          stories: {
            ...character.stories,
            main: 5,
            csiThreadbare: {
              grayOne: 1,
              skyguard: 1,
              weaver: 1,
              princeling: 1,
            }
          }
        })) {
          emitOthers(`${name} has a quiet conversation with a mysterious woman in a back corner of the room.`);
          emitSelf(`The woman cocks an eyebrow as she notices Audric's signet upon your finger.  "Audric forewarned me that you would be on your way, and what to expect of you, but I still find myself surprised."  Her voice has a magical musicality to it, the sound of wind chimes on a gentle breeze accompanying her speech.  She sighs, a defeatist affectation falling over her.  "Well, here we are, in any case.  Audric has need of someone such as yourself to help him investigate a number of what may be crime scenes, all across the Realms.  There have been murders taking place, four of them, to be precise, unsolved, and needing some manner of resolution.  Audric plans to provide said resolution.  All you need to do for your part, is find the bodies, and mark each of them as found.  Take these, you will need them."  The woman pulls a silken pouch from the folds of her robes, and it jingles with the sound of coin.  She pulls one out to show you, and you see that it is merely a large, unmarked disc of iron.  "Leave one of these with each of the bodies you find, and Audric will take care of the rest."  Next, the woman produces a folded sheet of parchment and hands it to you.  "Here is a list of your destinations and how to find them.  Unfortunately, I can tell you little else, my part in this act was merely to deliver the [list] and the [token] set to you.  Beyond that, all I can offer is a name for myself: you may call me [Sigga]."  She shakes her head and mutters under her breath.  "Old man and his crackpot ideas..."`);
          return true;
        }
      }

      if (character.stories.main > 4 && character.scene_id === SceneIds.PARLIAMENT_MARKET_INN) {
        emitOthers(`${name} has a quiet conversation with a mysterious woman in a back corner of the room.`);
        emitSelf(`"Good luck finding those bodies.  I do not envy you your task, but I hope we may meet again."`);
        return true;
      }

      emitOthers(`${name} talks with a mysterious woman here.`);
      emitSelf(`${npc.getName()} only acknowledges you with a glance and a nod.`);
      return true;
    }
  }

  return npc;
}
