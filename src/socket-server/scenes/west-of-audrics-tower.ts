import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { Navigable, SceneIds, handleNpcCommands, navigate, scenes } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { handleAggro } from '../../utils/combat';
import { npcImports } from '../npcs/csvNpcImport';
import { augment_aggro } from '../npcs/augment_aggro';
import { isAmbiguousFightRequest, isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.WEST_OF_AUDRICS_TOWER;
const title: string = "A Quiet Alley West of Audric's Tower";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.NORTH_OF_AUDRICS_TOWER,
    keywords: 'n north lane small'.split(' '),
    escapeKeyword: '[north]',
    departureDescription: (name: string) => `${name} leaves the alley to the north.`,
  },
  {
    sceneId: SceneIds.SOUTH_OF_AUDRICS_TOWER,
    keywords: 's south road large larger'.split(' '),
    escapeKeyword: '[south]',
    departureDescription: (name: string) => `${name} leaves the alley to the south.`,
  },
  {
    sceneId: SceneIds.DIRTY_NOOK,
    keywords: 'w west dirty nook'.split(' '),
    escapeKeyword: '[west]',
    departureDescription: (name: string) => `${name} leaves the alley to the west.`,
  },
];

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
    // Only relevant to scenes with npcs, to set up npc state
    if (!characterNpcs.has(character.id)) {
      // Populate NPCs
      characterNpcs.set(character.id, [
        npcFactory({
          csvData: npcImports.get(NpcIds.SMALL_RAT),
          character,
          lootInventory: [ ItemIds.DEAD_RAT ],
        }),
        augment_aggro(npcFactory({
          csvData: npcImports.get(NpcIds.RABID_RAT),
          character,
          lootInventory: [ ItemIds.DEAD_RAT ],
        })),
      ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.getDeathTime() && Date.now() - new Date(c.getDeathTime()).getTime() > 600000) c.setHealth(c.getHealthMax());
      })
    }
    
    const aggro: boolean = handleAggro(filterNpcsByStory(), character, handlerOptions);
    if (aggro) return true;

    handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })  
    
    return true;
  }
  
  if (isAmbiguousFightRequest(handlerOptions, scenes.get(character.scene_id))) return true;

  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} snoops around the alley.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`The alley is quiet, and it's clear that few people venture here.  There are no building entrances here, and no reason to come here.  With so little traffic, the alley has attracted more attention from rodents than the surrounding area.  To the [north] lies a small lane, to the [south] is a larger road, and to the [west] sits a dirty, rat-infested nook.`);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    filterNpcsByStory().forEach(npc => actorText.push(npc.getDescription()));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
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
