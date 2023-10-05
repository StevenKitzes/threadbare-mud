/* Use this template to create new scenes

import { navigateCharacter, writeCharacterStory } from '../../../sqlite/sqlite';
import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { scenes, SceneIds } from './scenes';
import { HandlerOptions } from '../server';

const id: SceneIds = SceneIds.;
const title: string = ;
const publicInventory: string[] = [];
const initialSceneState: any = {};

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    // Only relevant to scenes with scene state, to set up initial state
    if (!character.scene_states.hasOwnProperty(id)) {
      const newSceneState: any = { ...character.scene_states };
      newSceneState[sceneId] = initialSceneState;
      if (writeCharacterSceneStates(character.id, newSceneState)) {
        character.scene_states[id] = initialSceneState;
      }
    }
    
    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (command === 'look') {
    emitOthers();

    const actorText: string[] = [];
    // Only relevant to scenes that need to respond to story status
    if (
      // Check current story status
      character.stories. ===  &&
      // Make sure we only proceed if the DB is able to be successfully updated
      writeCharacterStory(character.id, { ...character.stories, :  })
    ) {
      character.stories.++;
      actorText.push(-);
    }
    // This will be pushed to actor text independent of story
    actorText.push('The cold, stone walls of this bedroom are plain and unadorned.  The uneven blocks were clearly cut and polished to form a smooth surface, but retain their natural shape, forming a strange mosaic with many mortar-filled gaps.  A simple table stands next to the bed.  A chest of [drawers] rests against the far wall.  A [window] set into the stone across from the bed has been left cracked open, and a gentle breeze rustles the thin curtains hanging there.  A needlessly large [door], made of dark, iron-bound wood, appears to be the only exit from the room.');
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, SceneIds.COLD_BEDROOM, character.name, emitOthers, emitSelf)) return true;
  
  if (command.includes()) {
    emitOthers();

    emitSelf();

    return true;
  }

  let destination: SceneIds;

  destination = ;
  if (command.includes() && navigateCharacter(character.id, destination)) {
    emitOthers();

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
};

*/
