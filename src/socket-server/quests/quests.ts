import { REGEX_QUEST_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { commandMatchesKeywordsFor, makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";

export function handleQuestsCommand(handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitSelf } = getEmitters(socket, character.scene_id);

  function main(actorText: string[], single: boolean): void {
    const texts: string[] = [];
    // Main quest: Finding Yourself
    switch (character.stories.main) {
      case 5: texts.push(`[Finding Yourself] - You met [Sigga], the Weaver from Rocksteppe, as unlikely a character as she may seem to be.  She gave you four strange, magical, iron tokens, and a list of places to drop them at the scenes of gruesome crimes.  The list accompanies a note from Audric referencing his promised reward once all the tokens are appropriately placed.`); if (!single) break;
      case 4: texts.push(`[Finding Yourself] - You brought the ~traveling kit~ to Audric and he broke it open to supply you for your future journeys.  He told you a suspicious tale about your role in his plans as an experiment in giving new life to a dead body, and sent you off on a quest to meet a friend of his at the Parliament Market Inn, north of the market.  Find a woman in sandy-colored clothes, and wear the ring Audric gave to you when you talk to her.`); if (!single) break;
      case 3: texts.push(`[Finding Yourself] - You found and purchased a ~traveling kit~, as Audric requested.  He wants you to bring it back to him at his library, in his tower, west of the market.`); if (!single) break;
      case 2: texts.push(`[Finding Yourself] - You met Audric in his library.  He wants you to buy a ~traveling kit~ at the Adventurer's Guild in town and return to him.  He said that the Guild could be found somewhere in the market, east of his tower.`); if (!single) break;
      case 1: texts.push(`[Finding Yourself] - You woke up in an unfamiliar bedroom.  What in the world?  Find someone to talk to to figure out what's going on!`); break;
      case 0: texts.push(`You have no such active quest at the moment.`); break;
      default: break;
    }
    actorText.push(...texts.reverse());
  }

  function csiThreadbareGrayOne(actorText: string[], single: boolean): void {
    const texts: string[] = [];
    // CSI Threadbare: find a gray corpse
    switch (character.stories.csiThreadbare.grayOne) {
      case 1: texts.push(`The [Gray One] - Audric asked you to travel east, through Ixpanne and Florenza, to the edge of the Inland Sea, in search of a crime scene.  Mark the location using one of his iron tokens so that his associates can take care of the rest.`); break;
      case 0: if (single) texts.push(`You have no such active quest at the moment.`); break;
      default: break;
    }
    actorText.push(...texts.reverse());
  }

  function csiThreadbareSoldier(actorText: string[], single: boolean): void {
    const texts: string[] = [];
    // CSI Threadbare: find a skyguard corpse
    switch (character.stories.csiThreadbare.skyguard) {
      case 1: texts.push(`The [Soldier] - Audric asked you to travel west, through Ixpanne and over the mountains, to the edge of the Great Beyond.  There he expects you'll find a crime scene of some kind, where you can mark the location using one of his iron tokens.  His associates will take care of the rest.`); break;
      case 0: if (single) texts.push(`You have no such active quest at the moment.`); break;
      default: break;
    }
    actorText.push(...texts.reverse());
  }

  function csiThreadbareWeaver(actorText: string[], single: boolean): void {
    const texts: string[] = [];
    // CSI Threadbare: find a weaver corpse
    switch (character.stories.csiThreadbare.weaver) {
      case 1: texts.push(`The [Weaver] - Audric asked you to travel to the distant east, out of Ixpanne and through Greenwood and the Weave, to the far reaches of the Threadbare.  He hopes you'll find evidence of a crime there that you can mark using one of his iron tokens.  His associates will handle the rest.`); break;
      case 0: if (single) texts.push(`You have no such active quest at the moment.`); break;
      default: break;
    }
    actorText.push(...texts.reverse());
  }

  function csiThreadbarePrinceling(actorText: string[], single: boolean): void {
    const texts: string[] = [];
    // CSI Threadbare: find a princeling weaver corpse
    switch (character.stories.csiThreadbare.princeling) {
      case 1: texts.push(`The [Princeling] - Audric asked you to investigate the main road along eastern shore of the Inland Sea, deep in the territory of the Weave.  He suspects you'll find evidence there of foul play.  Mark the location using one of his iron tokens so that his associates can take care of the rest.`); break;
      case 0: if (single) texts.push(`You have no such active quest at the moment.`); break;
      default: break;
    }
    actorText.push(...texts.reverse());
  }

  if (commandMatchesKeywordsFor(command, 'finding yourself main'.split(' '), REGEX_QUEST_ALIASES)) {
    const actorText: string[] = [];
    main(actorText, true);
    emitSelf(actorText);
    return true;
  }
  if (command.match(makeMatcher(REGEX_QUEST_ALIASES, 'gray one'))) {
    const actorText: string[] = [];
    csiThreadbareGrayOne(actorText, true);
    emitSelf(actorText);
    return true;
  }
  if (commandMatchesKeywordsFor(command, ['soldier'], REGEX_QUEST_ALIASES)) {
    const actorText: string[] = [];
    csiThreadbareSoldier(actorText, true);
    emitSelf(actorText);
    return true;
  }
  if (commandMatchesKeywordsFor(command, ['weaver'], REGEX_QUEST_ALIASES)) {
    const actorText: string[] = [];
    csiThreadbareWeaver(actorText, true);
    emitSelf(actorText);
    return true;
  }
  if (commandMatchesKeywordsFor(command, ['princeling'], REGEX_QUEST_ALIASES)) {
    const actorText: string[] = [];
    csiThreadbarePrinceling(actorText, true);
    emitSelf(actorText);
    return true;
  }

  if (command.match(makeMatcher(REGEX_QUEST_ALIASES))) {
    const actorText: string[] = [
      'You are engaged in the following quests:',
      '(Try [quest ~name~] to see the full history of a specific quest.)',
    ];
  
    main(actorText, false);
    csiThreadbareGrayOne(actorText, false);
    csiThreadbareSoldier(actorText, false);
    csiThreadbareWeaver(actorText, false);
    csiThreadbarePrinceling(actorText, false);
  
    emitSelf(actorText);
  
    return true;
  }
  return false;
}

export default handleQuestsCommand;
