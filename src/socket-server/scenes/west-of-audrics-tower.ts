import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { SceneIds, navigate } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactories } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';

const id: SceneIds = SceneIds.WEST_OF_AUDRICS_TOWER;
const title: string = "A Quiet Alley West of Audric's Tower";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

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
  
  if (navigate(
    handlerOptions,
    SceneIds.NORTH_OF_AUDRICS_TOWER,
    'n|north|lane|small lane',
    emitOthers,
    `${name} leaves the alley to the north.`,
  )) return true;

  if (navigate(
    handlerOptions,
    SceneIds.SOUTH_OF_AUDRICS_TOWER,
    's|south|road|larger road',
    emitOthers,
    `${name} leaves the alley to the south.`,
  )) return true;

  return false;
}

export {
  id,
  title,
  sentiment,
  horseAllowed,
  publicInventory,
  handleSceneCommand
};
