import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_GO_ALIASES, REGEX_LOOK_ALIASES } from "../../constants";
import { SceneSentiment } from "../../types";
import { isAmbiguousNavRequest } from "../../utils/ambiguousRequestHelpers";
import appendAlsoHereString from "../../utils/appendAlsoHereString";
import appendItemsHereString from "../../utils/appendItemsHereString";
import getEmitters from "../../utils/emitHelper";
import lookSceneItem from "../../utils/lookSceneItem";
import { allTokensMatchKeywords, commandMatchesKeywordsFor, makeMatcher } from "../../utils/makeMatcher";
import { ItemIds } from "../items/items";
import { HandlerOptions } from "../server";
import { Navigable, SceneIds, navigate, scenes } from "./scenes";

const id: SceneIds = SceneIds.CURVING_STONE_STAIRCASE;
const title: string = "A curving stone staircase";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = false;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.MAGNIFICENT_LIBRARY,
    keywords: 'up library stairs stairway staircase'.split(' '),
    escapeKeyword: '[up]',
    departureDescription: (name: string) => `${name} wanders up the stairs.`,
  },
  {
    sceneId: SceneIds.OUTSIDE_AUDRICS_TOWER,
    keywords: 'door heavy wooden market'.split(' '),
    escapeKeyword: 'through a wooden [door]',
    departureDescription: (name: string) => `${name} exits through the heavy, wooden door.`,
  },
];

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

  const destination = navigables[1].sceneId;
  const keywords: string[] = navigables[1].keywords;
  if (
    commandMatchesKeywordsFor(command, keywords, `${REGEX_GO_ALIASES}|open`) ||
    allTokensMatchKeywords(command, keywords)
  ) {
    if (character.stories.main < 2) {
      emitOthers(`${character.name} fails to open a locked door.`);
      emitSelf('You try the door, but find it locked; not by key and tumbler, but by some unseen force.');
      return true;
    }

    if (writeCharacterData(handlerOptions, { scene_id: destination })) {
      emitOthers(`${name} exits through the heavy, wooden door.`);
      
      socket.leave(sceneId);
      socket.join(destination);
      
      return scenes.get(destination).handleSceneCommand({
        ...handlerOptions,
        command: 'enter'
      });
    }
  }
  
  if (isAmbiguousNavRequest(handlerOptions, navigables)) return true;
  for (let i = 0; i < navigables.length; i++) {
    if (navigate(
      handlerOptions,
      navigables[i].sceneId,
      navigables[i].keywords,
      emitOthers,
      navigables[i].departureDescription(name),
      navigables[i].extraActionAliases,
    )) return true;
  }

  return false;
}

export {
  id,
  title,
  sentiment,
  horseAllowed,
  publicInventory,
  navigables,
  handleSceneCommand
}
