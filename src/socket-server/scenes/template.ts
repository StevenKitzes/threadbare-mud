/* Use this template to create new scenes

import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { scenes, navigate, handleNpcCommands, Navigable, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_GO_ALIASES, REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { isAmbiguousFightRequest, isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.;
const title: string = ;
const sentiment: SceneSentiment = SceneSentiment.;
const horseAllowed: boolean = ;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: 
    keywords: 
    escapeKeyword: 
    departureDescription: (name: string) => 
  },
  {
    sceneId: 
    keywords: 
    escapeKeyword: 
    departureDescription: (name: string) => 
  },
];

const initialSceneState: any = {};
const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();
const getSceneNpcs = (): Map<string, NPC[]> => characterNpcs;

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  const filterNpcsByStory = (): NPC[] => {
    const npcs: NPC[] | null = characterNpcs.get(character.id);
    if (npcs === null) return [];
    return npcs.filter(npc => {
      return true;
    })
  }

  if (command === 'enter') {
    // Only relevant to scenes with scene state, to set up initial state
    if (!character.scene_states.hasOwnProperty(id)) {
      const newSceneState: any = { ...character.scene_states };
      newSceneState[sceneId] = initialSceneState;
      writeCharacterData(handlerOptions, { scene_states: newSceneState });
    }

    // Only relevant to scenes with npcs, to set up npc state
    if (!characterNpcs.has(character.id)) {
      // Populate NPCs
      characterNpcs.set(character.id, [ - ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.getDeathTime() && Date.now() - new Date(c.getDeathTime()).getTime() > 600000) c.setHealth(c.getHealthMax());
      })
    }

    const aggro: boolean = handleAggro(filterNpcsByStory(), character, handlerOptions);
    const factionAggro: boolean = handleFactionAggro(characterNpcs, character, handlerOptions, emitOthers, emitSelf);
    if (aggro) return true;
    if (factionAggro) return true;

    handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    });  
    
    return true;
  }
  
  if (isAmbiguousFightRequest(handlerOptions, scenes.get(character.scene_id))) return true;

  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers();

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // Only relevant to scenes that need to respond to story status
    if (
      // Check current story status
      character.stories. ===  &&
      // Make sure we only proceed if the DB is able to be successfully updated
      writeCharacterData(handlerOptions, { stories: { ...character.stories, :  } })
    ) {
      actorText.push(-);
    }

    // This will be pushed to actor text independent of story
    actorText.push-;
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    filterNpcsByStory().forEach(npc => actorText.push(npc.getDescription()));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (commandMatchesKeywordsFor()) {
    emitOthers();

    emitSelf();

    return true;
  }

  // complex, story-controlled exit example;
  // place before navigable evaluations to intercept fallback of this example's self definition in navigables list
  let destination = SceneIds.-;
  if (command.match(makeMatcher(REGEX_GO_ALIASES, ))) {
    if (character.stories. < 2) {
      emitOthers(-);
      emitSelf(-);
      return true;
    }

    if (writeCharacterData(handlerOptions, { scene_id: destination })) {
      emitOthers(-);
      
      socket.leave(sceneId);
      socket.join(destination);
      
      return scenes.get(destination).handleSceneCommand({
        ...handlerOptions,
        command: 'enter'
      });
    }
  }

  // normal travel, concise
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
  handleSceneCommand,
  getSceneNpcs
};

*/
