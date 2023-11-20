import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { scenes, navigate, handleNpcCommands, Navigable, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { isAmbiguousFightRequest, isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';
import { npcImports } from '../npcs/csvNpcImport';
import { handleAggro } from '../../utils/combat';
import { augment_aggro } from '../npcs/augment_aggro';

const id: SceneIds = SceneIds.DIRTY_NOOK;
const title: string = 'A dirty nook';
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.WEST_OF_AUDRICS_TOWER,
    keywords: 'e east alley'.split(' '),
    escapeKeyword: '[east]',
    departureDescription: (name: string) => `${name} leaves the dirty nook for a quiet alley.`
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
          csvData: npcImports.get(NpcIds.STOUT_RAT),
          character,
          lootInventory: [ItemIds.DEAD_RAT]
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.SMALL_RAT),
          character,
          lootInventory: [ItemIds.DEAD_RAT]
        }),
        augment_aggro(npcFactory({
          csvData: npcImports.get(NpcIds.RABID_RAT),
          character,
          lootInventory: [ItemIds.DEAD_RAT]
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
    });  

    return true;
  }

  if (isAmbiguousFightRequest(handlerOptions, scenes.get(character.scene_id))) return true;

  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around at the dirty nook.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`You gaze around the dirty nook, enclosed on three sides by the stone and plaster walls of the surrounding buildings.  It looks like a place that hasn't been cleaned, or perhaps even visited, in years.  There is clear evidence of rodent infestation here, droppings and signs of nesting strewn all along the lower edges of the walls.  Gaps rusted out of a drainage grate imply a source of the constant rat problem in this part of town.  The only person-sized exit from here is back out to the [alley].`);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    filterNpcsByStory().forEach(npc => actorText.push(npc.getDescription()));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
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
