import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { handleNpcCommands, Navigable, navigate, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { handleFactionAggro } from '../../utils/combat';
import { npcImports } from '../npcs/csvNpcImport';
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.PARLIAMENT_NORTH_PROMENADE;
const title: string = "Parliament Northern Promenade";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_NORTHWEST_MARKET,
    keywords: 'w west market marketplace'.split(' '),
    escapeKeyword: '[west]',
    departureDescription: (name: string) => `${name} walks west, to another part of the market.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_NORTHEAST_MARKET,
    keywords: 'e east market marketplace'.split(' '),
    escapeKeyword: '[east]',
    departureDescription: (name: string) => `${name} walks east, to another part of the market.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_MARKET_INN,
    keywords: 'n north inn market parliament'.split(' '),
    escapeKeyword: '[north]',
    departureDescription: (name: string) => `${name} steps into the Parliament Market Inn to the north.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_MARKET_SQUARE,
    keywords: 's south market square'.split(' '),
    escapeKeyword: '[south]',
    departureDescription: (name: string) => `${name} heads south, to the Market Square.`,
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
          csvData: npcImports.get(NpcIds.SNEERING_PEACEKEEPER),
          character,
          lootInventory: [ ItemIds.SIMPLE_DAGGER ],
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.SCOWLING_PEACEKEEPER),
          character,
          lootInventory: [ ItemIds.STANDARD_ISSUE_SHORTSWORD ],
        }),
      ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.getDeathTime() && Date.now() - new Date(c.getDeathTime()).getTime() > 600000) c.setHealth(c.getHealthMax());
      })
    }
    
    const factionAggro: boolean = handleFactionAggro(characterNpcs, character, handlerOptions, emitOthers, emitSelf);
    if (factionAggro) return true;

    handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })  

    return true;
  }

  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around at the promenade.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`This part of the market is kept free of shops and stalls, meant to provide a calmer promenade.  It is a place for folk to stroll about or relax in the shade of trees on benches.  Peacekeepers, the city guard of Parliament, pass by on occasion.  To the north lies an inn and tavern with a sign over the door reading The [Parliament Market Inn].  To the [south], the beautiful, open Market Square spreads before you.  To the [east] and [west], the busting marketplace sprawls onward.`);
    appendSentimentText(character.job, sentiment, actorText);
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
