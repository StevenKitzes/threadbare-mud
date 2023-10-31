import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { navigate, Navigable, SceneIds, handleNpcCommands } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { npcImports } from '../npcs/csvNpcImport';
import { handleFactionAggro } from '../../utils/combat';
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.PARLIAMENT_MARKET_SQUARE;
const title: string = "Parliament Market Square";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_NORTH_PROMENADE,
    keywords: 'n north northern promenade'.split(' '),
    departureDescription: (name: string) => `${name} leaves toward the northern market promenade.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_WEST_MARKET,
    keywords: 'w west western market'.split(' '),
    departureDescription: (name: string) => `${name} leaves toward the western part of the market.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_MARKET_GATE,
    keywords: 'e east eastern market gate'.split(' '),
    departureDescription: (name: string) => `${name} leaves toward the Market Gate.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_SOUTH_PROMENADE,
    keywords: 's south southern promenade'.split(' '),
    departureDescription: (name: string) => `${name} leaves toward the southern market promenade.`
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
          csvData: npcImports.get(NpcIds.GLOWERING_PEACEKEEPER),
          character,
          lootInventory: [ ItemIds.STANDARD_ISSUE_SHORTSWORD ],
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.PEACEKEEPER_CAPTAIN),
          character,
          lootInventory: [ ItemIds.PEACEKEEPER_LONGSWORD ],
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.SNEERING_PEACEKEEPER),
          character,
          lootInventory: [ ItemIds.SIMPLE_DAGGER ],
        }),
      ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.getDeathTime() && Date.now() - new Date(c.getDeathTime()).getTime() > 600000) c.setHealth(c.getHealthMax());
      })
    }
    
    handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    });
    
    handleFactionAggro(characterNpcs, character, handlerOptions, emitOthers, emitSelf);
    
    return true;
  }
  
  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;
  
  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} gazes about the wondrous sights of the Market Square.`);
    
    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`The Parliament Market Square is the ultimate expression of the wealth and grandeur of Ixpanne.  While the wizard towers that stand through the city might be more expensive at the bottom line, the beauty of the Square stands alone.  The gardens, paths, and statuary here are downright palatial, though they are on display here for all to enjoy.  At the center of the Square is a fountain, over which spans a bridge, all cut from marble.  Water, fed by some unseen source, gushes out of the many likenesses of animals and monsters all over the fountain and its bridge.  The Market Square is so expansive that when standing at its center, the hustle and bustle of the surrounding market seems distant, muted.`);
    actorText.push(`The market proper can be reached either to the [east] or the [west].  You can see Audric's tower rising ever skyward, father to the west.  To the [north] and [south], the Market Square extends into a longer promenade.`)
    appendSentimentText(character.job, sentiment, actorText);
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
