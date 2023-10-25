import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_GO_ALIASES, REGEX_LOOK_ALIASES } from "../../constants";
import { SceneSentiment } from "../../types";
import appendAlsoHereString from "../../utils/appendAlsoHereString";
import appendItemsHereString from "../../utils/appendItemsHereString";
import getEmitters from "../../utils/emitHelper";
import lookSceneItem from "../../utils/lookSceneItem";
import { allTokensMatchKeywords, commandMatchesKeywordsFor, makeMatcher } from "../../utils/makeMatcher";
import { ItemIds } from "../items/items";
import { HandlerOptions } from "../server";
import { SceneIds, navigate, scenes } from "./scenes";

const id: SceneIds = SceneIds.CURVING_STONE_STAIRCASE;
const title: string = "A curving stone staircase";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = false;
const publicInventory: ItemIds[] = [];

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);
  
  if (command === 'enter') {
    emitOthers(`${character.name} steps onto the staircase.`);

    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around the confined space of the stair well.`);

    const actorText: string[] = [`{${title}}`, '- - -'];

    actorText.push("The walls of the staircase are made of plain, smooth-faced stone.  There are long, narrow tapestries of fine quality hanging here, and there is a lush carpet underfoot to soften your steps.  Light filters down from the top of the stairs, where you can see a [magnificent library], and below is a [heavy wooden door].");
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (navigate(
    handlerOptions,
    SceneIds.MAGNIFICENT_LIBRARY,
    'up library stairs stairway staircase'.split(' '),
    emitOthers,
    `${name} wanders up the stairs.`
  )) return true;

  let destination = SceneIds.OUTSIDE_AUDRICS_TOWER;
  const keywords: string[] = 'door heavy wooden market'.split(' ');
  if (
    commandMatchesKeywordsFor(command, keywords, `${REGEX_GO_ALIASES}|open`) ||
    allTokensMatchKeywords(command, keywords)
  ) {
    if (character.stories.main < 2) {
      emitOthers(`${character.name} fails to open a locked door.`);
      emitSelf('You try the door, but find it locked; not by key and tumbler, but by some unseen force.');
      return true;
    }

    if (writeCharacterData(character.id, { scene_id: destination })) {
      emitOthers(`${name} exits through the heavy, wooden door.`);
      
      socket.leave(sceneId);
      character.scene_id = destination;
      socket.join(destination);
      
      return scenes.get(destination).handleSceneCommand({
        ...handlerOptions,
        command: 'enter'
      });
    }
  }

  return false;
}

export {
  id,
  title,
  sentiment,
  horseAllowed,
  publicInventory,
  handleSceneCommand
}
