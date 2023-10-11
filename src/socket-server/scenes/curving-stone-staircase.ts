import { navigateCharacter } from "../../../sqlite/sqlite";
import { SceneSentiment } from "../../types";
import appendAlsoHereString from "../../utils/appendAlsoHereString";
import appendItemsHereString from "../../utils/appendItemsHereString";
import getEmitters from "../../utils/emitHelper";
import lookSceneItem from "../../utils/lookSceneItem";
import { NPC } from "../npcs/npcs";
import { HandlerOptions } from "../server";
import { SceneIds, scenes } from "./scenes";

const id: SceneIds = SceneIds.CURVING_STONE_STAIRCASE;
const title: string = "A curving stone staircase";
const sentiment: SceneSentiment = SceneSentiment.remote;
const publicInventory: string[] = [];

const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();

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

  if (command === 'look') {
    emitOthers(`${name} looks around the confined space of the stair well.`);

    const actorText: string[] = [title, '- - -'];

    actorText.push("The walls of the staircase are made of plain, smooth-faced stone.  There are long, narrow tapestries of fine quality hanging here, and there is a lush carpet underfoot to soften your steps.  Light filters down from the top of the stairs, where you can see a [magnificent library], and below is a [large heavy door].");
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  let destination: SceneIds;
  destination = SceneIds.MAGNIFICENT_LIBRARY;
  if (command.match(/^go (?:up|library)$/) && navigateCharacter(character.id, destination)) {
    emitOthers(`${name} wanders up the stairs.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  destination = SceneIds.OUTSIDE_AUDRICS_TOWER;
  if (command.match(/^go (?:door|large door|heavy door|large heavy door)$/)) {
    if (character.stories.main < 2) {
      emitOthers(`${character.name} fails to open a locked door.`);
      emitSelf('You try the door, but find it locked; not by key and tumbler, but by some unseen force.');
      return true;
    }

    if (navigateCharacter(character.id, destination)) {
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
  publicInventory,
  handleSceneCommand
}
