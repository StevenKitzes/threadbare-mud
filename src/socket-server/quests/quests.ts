import { REGEX_QUEST_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";

export function handleQuestsCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitSelf } = getEmitters(socket, character.scene_id);

  if (command.match(makeMatcher(REGEX_QUEST_ALIASES))) {
    const actorText: string[] = ['You are engaged in the following quests:'];
  
    // Main quest: Finding Yourself
    switch (character.stories.main) {
      case 0: /* storyline not yet started */ break;
      case 1: actorText.push(`Finding Yourself: You woke up in an unfamiliar bedroom.  What in the world?  Find someone to talk to to figure out what's going on!`); break;
      case 2: actorText.push(`Finding Yourself: You met Audric in his library.  He wants you to buy traveling supplies in town and return to him.`);
      default: break;
    }
  
    emitSelf(actorText);
  
    return true;
  }
  return false;
}

export default handleQuestsCommand;
