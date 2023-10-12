/* Use this template to create new scenes

import { navigateCharacter, writeCharacterStory } from '../../../sqlite/sqlite';
import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { scenes, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_GO_ALIASES, REGEX_LOOK_ALIASES } from '../../constants';

const id: SceneIds = SceneIds.;
const title: string = ;
const sentiment: SceneSentiment = SceneSentiment.;
const publicInventory: string[] = [];

const initialSceneState: any = {};
const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();

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

    // Only relevant to scenes with npcs, to set up npc state
    if (!characterNpcs.has(character.id)) {
      // Populate NPCs
      characterNpcs.set(character.id, [ npcFactories.get()() ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.deathTime && Date.now() - new Date(c.deathTime).getTime() > 600000) c.health = c.healthMax;
      })
    }

    // Aggro enemies attack!
    characterNpcs.get(character.id).forEach(c => {
      if (c.health > 0 && c.aggro) {
        c.handleNpcCommand({
          ...handlerOptions,
          command: `fight ${c.keywords[0]}`
        });
      }
    });

    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  // Only relevant to scenes with npcs, delete otherwise
  const sceneNpcs: NPC[] = characterNpcs.get(character.id);
  for (let i = 0; i < sceneNpcs.length; i++) if (sceneNpcs[i].handleNpcCommand(handlerOptions)) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers();

    const actorText: string[] = [title, '- - -'];
    
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
    actorText.push;
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    characterNpcs.get(character.id).forEach(npc => actorText.push(npc.getDescription(character)));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (command.match(makeMatcher())) {
    emitOthers();

    emitSelf();

    return true;
  }

  let destination: SceneIds;

  destination = ;
  if (
    command.match(makeMatcher(REGEX_GO_ALIASES, )) &&
    navigateCharacter(character.id, destination)
  ) {
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
  sentiment,
  publicInventory,
  handleSceneCommand
};

*/
