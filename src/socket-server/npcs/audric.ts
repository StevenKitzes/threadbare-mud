import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_FIGHT_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { CharacterUpdateOpts } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { allTokensMatchKeywords, captureGiveMatchWithRecipient, commandMatchesKeywordsFor } from "../../utils/makeMatcher";
import items, { ItemIds } from "../items/items";
import { SceneIds } from "../scenes/scenes";
import { HandlerOptions } from "../server";
import { NPC } from "./npcs";

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
      return `[Audric] sits on a luxurious couch, with his hands folded over his lap and a pleasant smile on his face.  "I look forward to seeing the traveling kit you return with!"`;
    }

    if (
      npc.private.characterRef.stories.main === 3 &&
      npc.private.characterRef.scene_id === SceneIds.MAGNIFICENT_LIBRARY
    ) {
      return `[Audric] sits on a luxurious couch, with his hands folded over his lap and a pleasant smile on his face.  "Have you gotten your hands on that traveling kit?"  You can [give ~kit~ to audric] if you are ready.`;
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

  npc.handleNpcTalk = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // talk to Audric, this can move the story
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_TALK_ALIASES)) {
      // main story at 1, scene at library
      if (character.stories.main === 1 && character.scene_id === SceneIds.MAGNIFICENT_LIBRARY) {
        let characterUpdate: CharacterUpdateOpts = {};
        characterUpdate.stories = { ...character.stories, main: 2 };
        characterUpdate.money = character.money + 50;
        characterUpdate.inventory = [ ...character.inventory, ItemIds.FILSTREDS_GUIDE_BOOK ];
    
        if (writeCharacterData(handlerOptions, characterUpdate)) {
          const actorText: string[] = [];
          actorText.push(`"Welcome, my friend!"  The old man rises to greet you.  "You must be wondering why you are here.  First of all, my name is [Audric], and it is a pleasure, I'm sure!  You are a guest in my home, in the city of Parliament, capital of the Realm of Ixpanne.  You would surely like to know more about how you've come to be here, but I'm afraid I must ask something in return.  I'd like you to run an errand for me in town.  Would you please buy and bring me a [traveling kit] from the Adventurer's Guild?  They keep their shop in the market.  Oh, yes, on my coin, of course!"`);
          actorText.push(`He hands you a fistful of coin and gestures toward the [staircase] leading out of the library.  "I look forward to your success!"`);
          actorText.push(`"Oh!  A moment!  I almost forgot..."  The old man rushes to one of his many stacks of books and returns with a heavy volume.  There is no dust on it.  He must refer to it often.  "You may find this exceedingly helpful on your way."  He hands you the book.  You can check your [inventory] to see it, or try [read book] to read it.`)
          emitOthers(`${name} has a quiet conversation with Audric.`);
          emitSelf(actorText);
          return true;
        }
      }

      // main story at 2-3, scene at library
      if ([2, 3].includes(character.stories.main) && character.scene_id === SceneIds.MAGNIFICENT_LIBRARY) {
        emitOthers(`${name} has a quiet conversation with Audric.`);
        emitSelf("Audric greets you warmly and continues to wait patiently for you to return with the [traveling kit] he requested.");
        return true;
      }

      emitOthers(`${name} talks with ${npc.getName()}.`);
      emitSelf(`${npc.getName()} engages you in lively (but vapid) conversation.  His smile suggests he is more intelligent than he lets on, but also that he expects - maybe even desires for you to see through him.`);
      return true;
    }
  }

  npc.handleNpcGive = (handlerOptions: HandlerOptions): boolean => {
    const { command, character } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters( handlerOptions.socket, character.scene_id );

    // give to audric
    const giveMatch: string | null = captureGiveMatchWithRecipient(command, npc.getKeywords());
    // if given object is traveling kit
    if (giveMatch !== null && allTokensMatchKeywords(giveMatch, items.get(ItemIds.TRAVELING_KIT).keywords)) {
      // if story, location, and character inventory are correct
      if (
        character.stories.main === 3 &&
        character.scene_id === SceneIds.MAGNIFICENT_LIBRARY && 
        character.inventory.includes(ItemIds.TRAVELING_KIT) &&
        writeCharacterData(handlerOptions, {
          inventory: [ ...character.inventory ]
            .splice(character.inventory.findIndex(i => items.get(i).id === ItemIds.TRAVELING_KIT), 1),
          stories: { ...character.stories, main: 4 },
        })
      ) {
        emitOthers(`${character.name} hands ${items.get(ItemIds.TRAVELING_KIT)} to ${npc.getName()}, and they have a chat together.`);
        emitSelf(`You hand ${items.get(ItemIds.TRAVELING_KIT).title} to ${npc.getName()} and he accepts it graciously.  "Ahh, thank you for picking that up for me!  It'll come in handy in the coming days, I assure you."`);
        return true;
      }
    }
    return false;
  }

  return npc;
}
