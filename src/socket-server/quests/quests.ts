import { REGEX_QUEST_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { makeMatcher } from "../../utils/makeMatcher";
import { npcImports } from "../npcs/csvNpcImport";
import { NpcIds, npcFactory } from "../npcs/npcs";
import { HandlerOptions } from "../server";

export function handleQuestsCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitSelf } = getEmitters(socket, character.scene_id);

  if (command.match(makeMatcher(REGEX_QUEST_ALIASES))) {
    const actorText: string[] = ['You are engaged in the following quests:'];
  
    // Main quest: Finding Yourself
    switch (character.stories.main) {
      case 0: /* storyline not yet started */ break;
      case 1: actorText.push(`[Finding Yourself]: You woke up in an unfamiliar bedroom.  What in the world?  Find someone to talk to to figure out what's going on!`); break;
      case 2: actorText.push(`[Finding Yourself]: You met ${npcImports.get(NpcIds.AUDRIC).name} in his library.  He wants you to buy a ~traveling kit~ at the Adventurer's Guild in town and return to him.  He said that the Guild could be found somewhere in the market, east of his tower.`); break;
      case 3: actorText.push(`[Finding Yourself]: You found and purchased a ~traveling kit~, as ${npcImports.get(NpcIds.AUDRIC).name} requested.  He wants you to bring it back to him at his library, in his tower, west of the market.`); break;
      case 4: actorText.push(`[Finding Yourself]: You brought the ~traveling kit~ to ${npcImports.get(NpcIds.AUDRIC).name} and he broke it open to supply you for your future journeys.  He told you a suspicious tale about your role in his plans as an experiment in giving new life to a dead body, and sent you off on a quest to meet a friend of his at the Parliament Market Inn, north of the market.  Find a woman in sandy-colored clothes, and wear the ring ${npcImports.get(NpcIds.AUDRIC).name} gave to you when you talk to her.`); break;
      default: break;
    }
  
    emitSelf(actorText);
  
    return true;
  }
  return false;
}

export default handleQuestsCommand;
