import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";

export function handleQuestsCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitSelf } = getEmitters(socket, character.scene_id);

  if (command.match(/^(?:quest|quests|mission|missions|story|stories)$/)) {
    const actorText: string[] = ['You are engaged in the following quests:'];
  
    // Main quest
    switch (character.stories.main) {
      case 0: actorText.push(`You have yet to awaken . . .`); break;
      case 1: actorText.push(`You woke up in an unfamiliar bedroom.  What in the world?  Find someone to talk to to figure out what's going on!`); break;
      case 2: actorText.push(`You met Audric in his library.  He wants you to buy traveling supplies in town and return to him.`);
      default: break;
    }
  
    emitSelf(actorText);
  
    return true;
  }
  return false;
}

export default handleQuestsCommand;
