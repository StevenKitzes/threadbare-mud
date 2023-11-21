import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_TALK_ALIASES } from "../../constants";
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

    if (
      npc.private.characterRef.stories.main >= 4 &&
      npc.private.characterRef.scene_id === SceneIds.MAGNIFICENT_LIBRARY
    ) {
      return `[Audric] rests on his luxurious couch, enjoying a cup of tea.  "Have you gone to meet my friend at the Market Inn?  She should be waiting for you there, north of the market, which is itself east of here.  I expect you'll have no trouble finding it.  Or her!  Good luck!"`;
    }

    return `[Audric] rests here with a light smile on his face.  His rich robes and jewelry lie easy on his thin frame.`;
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
          actorText.push(`"Welcome, my friend!"  The old man rises to greet you.  "You must be wondering why you are here.  First of all, my name is [Audric], and it is a pleasure, I'm sure!  You are a guest in my home, in the city of Parliament, capital of the Realm of Ixpanne.  You would surely like to know more about how you've come to be here, but I'm afraid I must ask something in return.  Or perhaps, I should say, in advance.  I'd like you to run an errand for me in town.  Would you please buy and bring me a [traveling kit] from the Adventurer's Guild?  They keep their shop in the market, east of here.  Oh, yes, that would be on my coin, of course!"`);
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
        emitSelf(`"Ahh, wonderful to see you again, my new friend!  By chance, have you managed to retrieve that [traveling kit] I asked you about?"`);
        return true;
      }

      // main story at 4, scene at library
      if (character.stories.main === 4 && character.scene_id === SceneIds.MAGNIFICENT_LIBRARY) {
        emitOthers(`${name} has a quiet conversation with Audric.`);
        emitSelf(`"Go and see my friend at the Parliament Market Inn, north of the marketplace.  She will direct you on what else we need to accomplish, and once she is satisfied, I will have more to share with you!"`);
        return true;
      }

      emitOthers(`${name} talks with ${npc.getName()}.`);
      emitSelf(`${npc.getName()} engages you in lively (but vapid) conversation.  His smile suggests he is more intelligent than he lets on, but also that he expects - maybe even desires - for you to see through him.`);
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
      const newInventory: ItemIds[] = [ ...character.inventory, ItemIds.TRAVEL_RATIONS, ItemIds.TRAVEL_RATIONS, ItemIds.TRAVEL_RATIONS, ItemIds.TRAVEL_RATIONS, ItemIds.TRAVEL_RATIONS, ItemIds.LIGHT_LEATHER_BOOTS, ItemIds.LIGHT_LEATHER_VEST, ItemIds.AUDRICS_SIGNET ];
      const spliceIndex: number = character.inventory.findIndex((i: ItemIds) => i === ItemIds.TRAVELING_KIT);
      newInventory.splice(spliceIndex, 1);
      if (
        character.stories.main === 3 &&
        character.scene_id === SceneIds.MAGNIFICENT_LIBRARY && 
        character.inventory.includes(ItemIds.TRAVELING_KIT) &&
        writeCharacterData(handlerOptions, {
          inventory: newInventory,
          stories: { ...character.stories, main: 4 },
        })
      ) {
        emitOthers(`${character.name} hands ${items.get(ItemIds.TRAVELING_KIT)} to ${npc.getName()}, and they have a chat together.`);
        emitSelf([
          `You hand ${items.get(ItemIds.TRAVELING_KIT).title} to ${npc.getName()} and he accepts it graciously.  "Ahh, thank you for taking care of that for me!  This will come in handy in the coming days, I assure you."  He opens the package, revealing a few days' worth of travel rations, a protective leather vest, and a pair of leather boots.  He hands the lot of it to you.  "Handy, indeed!"`,
          `${npc.getName()} rubs his hands together expectantly.  "Now, I am prepared to begin to share some of the information I promised with you regarding your history.  That was what I promised, wasn't it?"  He laughs at himself for a moment.  "Now, you may want to brace yourself for this.  The truth of the matter is that you are a bit of an experiment I've been conducting.  I'm working on a new, less repulsive technique to replace the messy art of what others call necromancy.  Rather than simply animating a corpse - ugh, disgusting - I prefer the notion of giving new life, a clean new soul, to a perfectly good, but empty, vessel!  You are the first I've tried this on.  Hope you're feeling alright?  In any case, there is more to your story, of course, but again, I'll have to ask you to play along if you want to learn more about where you've come from!"`,
          `A thoughful look comes over the old man's face.  "A friend of mine should be waiting at the +Parliament Market Inn+, at the north end of the market.  Here is a ring to identify you as my associate.  If you wear it, she will speak with you about the next steps we must take in our journey.  I assure you, in the long term, there will be more in it for you, beyond what I can share of your past.  You will know her by her distinctive choice of attire.  She wears cloth of the same color as the land whence she hails, Rocksteppe.  Good luck, and I shall see you again once you've worked out some details with her!"`
        ]);
        return true;
      }
    }
    return false;
  }

  return npc;
}
