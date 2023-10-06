import { navigateCharacter } from "../../../sqlite/sqlite";
import appendAlsoHereString from "../../utils/appendAlsoHereString";
import appendItemsHereString from "../../utils/appendItemsHereString";
import getEmitters from "../../utils/emitHelper";
import lookSceneItem from "../../utils/lookSceneItem";
import { HandlerOptions } from "../server";
import { SceneIds, scenes } from "./scenes";

const id: SceneIds = SceneIds.CURVING_STONE_STAIRCASE;
const title: string = "A curving stone staircase";
const publicInventory: string[] = [];

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (command === 'look') {
    emitOthers(`${name} looks around the bedroom.`);

    const actorText: string[] = [title, '- - -'];

    actorText.push("This is a pretty plain stone staircase.  At the bottom is stuff I haven't created yet.  You can go [up] the stairs, but the bottom is blocked.");
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, id, character.name, emitOthers, emitSelf)) return true;
  
  let destination: SceneIds = SceneIds.MAGNIFICENT_LIBRARY;
  if (command.includes('go up') && navigateCharacter(character.id, destination)) {
    emitOthers(`${name} wanders up the stairs.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  return false;
}

export {
  id,
  title,
  publicInventory,
  handleSceneCommand
}
