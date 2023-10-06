import { navigateCharacter } from "../../../sqlite/sqlite";
import appendAlsoHereString from "../../utils/appendAlsoHereString";
import appendItemsHereString from "../../utils/appendItemsHereString";
import getEmitters from "../../utils/emitHelper";
import lookSceneItem from "../../utils/lookSceneItem";
import { HandlerOptions } from "../server";
import { SceneIds, scenes } from "./scenes";

const id: SceneIds = SceneIds.MAGNIFICENT_LIBRARY;
const title: string = "A marvelous library";
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
    emitOthers(`${name} looks around the library.`);

    const actorText: string[] = [title, '- - -'];
    
    actorText.push("The arched ceiling soars high overhead, obscured in darkness.  The [bookshelves] lining the walls of this circular room rise into those same shadows.  Light of every color streams into the main part of the library through stained glass windows, and motes of dust hang in the air, sparkling and shimmering.  Luxurious pillows and upholstery line the elaborate furnishings - though the vivacity of the scene is dulled a bit by a thin layer of dust that lies over everything.  The number and variety of the library's many [books] and [scrolls] is also impressive.  They are stacked on tables and desks in piles, disorderly but not quite discarded.");
    actorText.push("Aside from the [heavy door] you first used to enter this room, there are a few others, but for now they are all locked.  You can also go down a curving stone [staircase].");
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    
    emitSelf(actorText);

    return true;
  }
  
  if (lookSceneItem(command, id, character.name, emitOthers, emitSelf)) return true;
  
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

  let destination: SceneIds = SceneIds.COLD_BEDROOM;
  if (command.includes('go heavy door') && navigateCharacter(character.id, destination)) {
    emitOthers(`${name} departs through a heavy wooden door.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  destination = SceneIds.CURVING_STONE_STAIRCASE;
  if (command.includes('go staircase') && navigateCharacter(character.id, destination)) {
    emitOthers(`${name} heads down a curving stone staircase.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  return false;
};

export {
  id,
  title,
  publicInventory,
  handleSceneCommand
};
