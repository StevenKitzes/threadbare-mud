import { navigateCharacter, writeCharacterStory } from '../../../sqlite/sqlite';
import { HandlerOptions } from '../server';
import { appendAlsoHereString } from '../../utils/appendAlsoHereString';
import { getEmitters } from '../../utils/emitHelper';

export type Scene = {
  title: string;
  publicInventory: string[];
  handleSceneCommand: (handlerOptions: HandlerOptions) => boolean;
};

export const scenes: Map<string, Scene> = new Map<string, Scene>();

export enum SceneIds {
  A_COLD_BEDROOM = "0",
  A_MARVELOUS_LIBRARY = "1",
}

scenes.set(SceneIds.A_COLD_BEDROOM, {
  title: "A cold bedroom",
  publicInventory: [],
  handleSceneCommand: (handlerOptions: HandlerOptions): boolean => {
    const { character, characterList, command, socket } = handlerOptions;
    const { name, scene_id: sceneId } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

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
      
      emitSelf(actorText);

      return true;
    }
    
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

    if (command.includes('go door') && navigateCharacter(character.id, SceneIds.A_MARVELOUS_LIBRARY)) {
      emitOthers(`${name} departs through a heavy wooden door.`);

      socket.leave(sceneId);
      character.scene_id = SceneIds.A_MARVELOUS_LIBRARY
      socket.join(SceneIds.A_MARVELOUS_LIBRARY)

      return scenes.get(SceneIds.A_MARVELOUS_LIBRARY).handleSceneCommand({
        ...handlerOptions,
        command: 'look'
      });
    }

    return false;
  }
});

scenes.set(SceneIds.A_MARVELOUS_LIBRARY, {
  title: "A marvelous library",
  publicInventory: [],
  handleSceneCommand: (handlerOptions: HandlerOptions): boolean => {
    const { character, characterList, command, socket } = handlerOptions;
    const { name, scene_id: sceneId } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

    if (command === 'look') {
      emitOthers(`${name} looks around the library.`);

      const actorText: string[] = [];
      actorText.push("The arched ceiling soars high overhead, obscured in darkness.  The [bookshelves] lining the walls of this circular room rise into those same shadows.  Down below, light of every color streams in through stained glass windows, and motes of dust hang in the air, sparkling and shimmering.  Luxurious pillows and upholstery line the elaborate furnishings - though the vivacity of the scene is dulled a bit by a thin layer of dust that lies over everything.  The number and variety of the library's many [books] and [scrolls] is also impressive.  They are stacked on tables and desks in piles, disorderly but not quite discarded.");
      actorText.push("Aside from the [heavy door] you first used to enter this room, there are a few others, but for now they are all locked.");
      appendAlsoHereString(actorText, character, characterList);
      
      emitSelf(actorText);

      return true;
    }
    
    if (command.includes('look bookshelves')) {
      emitOthers(`${name} gazes up at the soaring bookshelves.`);
      emitSelf("The bookshelves sag with the weight of hundreds, if not thousands, of heavy volumes.  The collection is impressive.  Old books, newer books, books with pages missing and others with extra pages stuffed in.  Books on the magical, the mundane, the medical and the technical, on the artistic, the philosophical, on the mathmatical and even the comedic.  In languages you don't know and have never heard of.");
      return true;
    }

    if (command.includes('look books')) {
      emitOthers(`${name} peruses the stacks of discarded books.`);
      emitSelf("It is amazing how many books are piled on the tables and desks.  Some have clearly been used more recently than others, as told by the varying thickness of the dust on their covers.  Some lie open, while others have bookmarks tucked between their pages.  The library seems active, if only just.");
      return true;
    }

    if (command.includes('look scrolls')) {
      emitOthers(`${name} casts an eye to the scrolls littering the library.`);
      emitSelf("Scrolls lie amid the books.  Some are tied with ribbon, others with twine, others curled shut only because that is how they look to have spent hundreds of their long years.  The runes scrawled over their surfaces provide no hint to the casual observer as to their meanings.");
      return true;
    }

    if (command.includes('look heavy door')) {
      emitOthers(`${name} inspects a heavy wooden door.`);
      emitSelf("The door is near twice as tall as it needs to be for someone to pass comfortably through, and wider than necessary, as well.  A mark of luxury?  You wouldn't think so, considering the crude iron binding that holds it together, or the lack of any ornamentation.");
      return true;
    }

    if (command.includes('peek heavy door')) {
      emitOthers(`${name} sneaks a peek through a heavy wooden door.`);
      emitSelf("You see the bedroom with satin sheets in which you once awakened with no memory . . .");
      return true;
    }

    if (command.includes('go heavy door') && navigateCharacter(character.id, SceneIds.A_COLD_BEDROOM)) {
      emitOthers(`${name} departs through a heavy wooden door.`);

      socket.leave(sceneId);
      character.scene_id = SceneIds.A_COLD_BEDROOM;
      socket.join(SceneIds.A_COLD_BEDROOM)

      return scenes.get(SceneIds.A_COLD_BEDROOM).handleSceneCommand({
        ...handlerOptions,
        command: 'look'
      });
    }

    return false;
  }
});

export default {
  scenes
}
