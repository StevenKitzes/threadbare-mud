import { navigateCharacter, writeCharacterStory } from '../../../sqlite/sqlite';
import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { scenes, SceneIds } from '../scenes/scenes';
import { HandlerOptions } from '../server';

const id: SceneIds = SceneIds.COLD_BEDROOM;
const title: string = "A cold bedroom";
const publicInventory: string[] = [];
const initialSceneState: any = {
  headbandHere: true,
  tunicHere: true,
  pantsHere: true,
  bootsHere: true,
  daggerHere: true
};

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    if (!character.scene_states.hasOwnProperty(id)) {
      character.scene_states[id] = initialSceneState;
    }
    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (command === 'look') {
    emitOthers(`${name} looks around the bedroom.`);

    const actorText: string[] = [];
    if (
      character.stories.main === 0 &&
      writeCharacterStory(character.id, { ...character.stories, main: 1 })
    ) {
      character.stories.main++;
      actorText.push("You awaken to the feeling of satin sheets against your skin and a comfortable mattress beneath you.  You hear voices, a whole grandiose chorus of them, singing a song that seems to fall from its crescendo just as you are coming to your senses.  As your thoughts begin to coalesce, you realize that you have no memory of how you came to be where you are.  In fact, you aren't even sure who you are, beyond a name that rings in the corner of your mind:");
      actorText.push(`${name}.`);
    }
    actorText.push('The cold, stone walls of this bedroom are plain and unadorned.  The uneven blocks were clearly cut and polished to form a smooth surface, but retain their natural shape, forming a strange mosaic with many mortar-filled gaps.  A simple table stands next to the bed.  A chest of [drawers] rests against the far wall.  A [window] set into the stone across from the bed has been left cracked open, and a gentle breeze rustles the thin curtains hanging there.  A needlessly large [door], made of dark, iron-bound wood, appears to be the only exit from the room.');
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, id, character.name, emitOthers, emitSelf)) return true;
  
  if (command.includes('look drawers')) {
    emitOthers(`${name} investigates a chest of drawers.`);

    emitSelf('You see a sturdy, but otherwise ordinary, chest of drawers.');

    return true;
  }

  if (command.includes('peek drawers')) {
    emitOthers(`${name} peeks inside a chest of drawers.`);
    emitSelf('There is nothing inside.');
    return true;
  }

  if (command.includes('look window')) {
    emitOthers(`${name} peeks out the window.`);
    emitSelf("The view out the window is dizzying.  A bustling town lies below, far below . . . so far below that it is difficult to make out individual people through the clouds.  Rooftops sprawl away in all directions.  An expanse of farmlands lays beyond, and in the farther distance, mountains and an ocean are visible.");
    return true;
  }

  if (command.includes('look door')) {
    emitOthers(`${name} inspects a heavy wooden door.`);
    emitSelf("The door is near twice as tall as it needs to be for someone to pass comfortably through, and wider than necessary, as well.  A mark of luxury?  You wouldn't think so, considering the crude iron binding that holds it together, or the lack of any ornamentation.");
    return true;
  }

  if (command.includes('peek door')) {
    emitOthers(`${name} sneaks a peek through a heavy wooden door.`);
    emitSelf('Beyond the door, you can make out what looks to be a fabulous library.  You can see hints of bookshelves and dusty piles of old tomes and stacked scrolls.  The furniture is diverse and elaborate and the room is lit by a sparkling, multi-colored light filtering in through stained glass windows.');
    return true;
  }

  let destination: SceneIds = SceneIds.MAGNIFICENT_LIBRARY;
  if (command.includes('go door') && navigateCharacter(character.id, destination)) {
    emitOthers(`${name} departs through a heavy wooden door.`);

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
