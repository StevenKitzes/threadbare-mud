import { navigateCharacter } from "../../../sqlite/sqlite";
import appendAlsoHereString from "../../utils/appendAlsoHereString";
import appendItemsHereString from "../../utils/appendItemsHereString";
import getEmitters from "../../utils/emitHelper";
import lookSceneItem from "../../utils/lookSceneItem";
import { NPC, NpcIds, npcFactories } from "../npcs/npcs";
import { HandlerOptions } from "../server";
import { SceneIds, scenes } from "./scenes";

const id: SceneIds = SceneIds.CURVING_STONE_STAIRCASE;
const title: string = "A curving stone staircase";
const publicInventory: string[] = [];

const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);
  
  if (command === 'enter') {
    emitOthers(`${character.name} steps onto the staircase.`);

    if (!characterNpcs.has(character.id)) {
      // Populate NPCs
      characterNpcs.set(character.id, [ npcFactories.get(NpcIds.STOUT_RAT)(), npcFactories.get(NpcIds.SMALL_RAT)() ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.deathTime && Date.now() - new Date(c.deathTime).getTime() > 600000) c.health = c.healthMax;
      })
    }

    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  const sceneNpcs: NPC[] = characterNpcs.get(character.id);
  for (let i = 0; i < sceneNpcs.length; i++) if (sceneNpcs[i].handleNpcCommand(handlerOptions)) return true;

  if (command === 'look') {
    emitOthers(`${name} looks around the confined space of the stair well.`);

    const actorText: string[] = [title, '- - -'];

    actorText.push("The walls of the staircase are made of plain, smooth-faced stone.  There are long, narrow tapestries of fine quality hanging here, and there is a lush carpet underfoot to soften your steps.  Light filters down from the top of the stairs, where you can see a [magnificent library], and below is another [large heavy door].");
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    characterNpcs.get(character.id).forEach(npc => {
      if (npc.health > 0) actorText.push(npc.description);
      else actorText.push(`The corpse of ${npc.name} lies here.`);
    });

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, id, character.name, emitOthers, emitSelf)) return true;
  
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

  destination = SceneIds.MAGNIFICENT_LIBRARY;
  if (command.match(/^go (?:door|large door|heavy door|large heavy door)$/)) {
    if (character.stories.main < 2) {
      emitOthers(`${character.name} fails to open a locked door.`);
      emitSelf('You try the door, but find it locked; not by key and tumbler, but by some unseen force.');
      return true;
    }

    if (navigateCharacter(character.id, destination)) {
      emitOthers(`${name} wanders up the stairs.`);
      
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
  publicInventory,
  handleSceneCommand
}
