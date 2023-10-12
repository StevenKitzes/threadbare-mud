import { navigateCharacter } from '../../../sqlite/sqlite';
import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { scenes, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactories } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { REGEX_GO_ALIASES, REGEX_LOOK_ALIASES } from '../../constants';
import { makeMatcher } from '../../utils/makeMatcher';

const id: SceneIds = SceneIds.NORTH_OF_AUDRICS_TOWER;
const title: string = "North of Audric's Tower";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const publicInventory: string[] = [];

const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    // Only relevant to scenes with npcs, to set up npc state
    if (!characterNpcs.has(character.id)) {
      // Populate NPCs
      characterNpcs.set(character.id, [ npcFactories.get(NpcIds.SMALL_RAT)() ]);
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

  // Only relevant to scenes with npcs, delete otherwise
  const sceneNpcs: NPC[] = characterNpcs.get(character.id);
  for (let i = 0; i < sceneNpcs.length; i++) if (sceneNpcs[i].handleNpcCommand(handlerOptions)) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${character.name} looks around.`);

    const actorText: string[] = [title, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push("The crowd thins a bit here, north of Audric's tower.  The front of Audric's tower lies [east] of here, and there you can hear the bustle of a thriving marketplace.  Here, though, fewer people venture, as there is less to do, and some of the city's cracks show through its veneer.  There is some trash blown up against the buildings by the wind, and you can see evidence of rodents.  Along the western flank of Audric's tower you can see a quiet [alley].");
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    characterNpcs.get(character.id).forEach(npc => actorText.push(npc.getDescription(character)));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  let destination: SceneIds;

  destination = SceneIds.OUTSIDE_AUDRICS_TOWER;
  if (
    command.match(makeMatcher(REGEX_GO_ALIASES, 'east|market|marketplace')) &&
    navigateCharacter(character.id, destination)
  ) {
    emitOthers(`${character.name} heads east.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  destination = SceneIds.WEST_OF_AUDRICS_TOWER;
  if (
    command.match(makeMatcher(REGEX_GO_ALIASES, 'west|alley')) &&
    navigateCharacter(character.id, destination)
  ) {
    emitOthers(`${character.name} heads into a quiet alley.`);

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
  sentiment,
  publicInventory,
  handleSceneCommand
};
