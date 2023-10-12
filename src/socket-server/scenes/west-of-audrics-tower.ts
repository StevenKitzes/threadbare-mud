import { navigateCharacter, writeCharacterStory } from '../../../sqlite/sqlite';
import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { scenes, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactories } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_GO_ALIASES, REGEX_LOOK_ALIASES } from '../../constants';

const id: SceneIds = SceneIds.WEST_OF_AUDRICS_TOWER;
const title: string = "A Quiet Alley West of Audric's Tower";
const sentiment: SceneSentiment = SceneSentiment.remote;
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
      characterNpcs.set(character.id, [
        npcFactories.get(NpcIds.SMALL_RAT)(),
        npcFactories.get(NpcIds.RABID_RAT)()
      ]);
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
    emitOthers(`${name} snoops around the alley.`);

    const actorText: string[] = [title, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`The alley is quiet, and it's clear that few people venture here.  There are no building entrances here, and no reason to come here.  With so little traffic, the alley has attracted more attention from rodents than the surrounding area.  You can leave this alley to the [north] or the [south].`);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    characterNpcs.get(character.id).forEach(npc => actorText.push(npc.getDescription(character)));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  let destination: SceneIds;

  destination = SceneIds.NORTH_OF_AUDRICS_TOWER;
  if (
    command.match(makeMatcher(REGEX_GO_ALIASES, 'north')) &&
    navigateCharacter(character.id, destination)
  ) {
    emitOthers(`${name} leaves the alley to the north.`);

    socket.leave(sceneId);
    character.scene_id = destination;
    socket.join(destination);

    return scenes.get(destination).handleSceneCommand({
      ...handlerOptions,
      command: 'enter'
    });
  }

  destination = SceneIds.SOUTH_OF_AUDRICS_TOWER;
  if (
    command.match(makeMatcher(REGEX_GO_ALIASES, 'south')) &&
    navigateCharacter(character.id, destination)
  ) {
    emitOthers(`${name} leaves the alley to the south.`);

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
