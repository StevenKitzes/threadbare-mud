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
import { npcImports } from '../npcs/csvNpcImport';
import { augment_gruffInnkeeper } from '../npcs/gruff-innkeeper';
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.PARLIAMENT_MARKET_INN;
const title: string = "The Parliament Market Inn";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = false;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_NORTH_PROMENADE,
    keywords: 's south northern promenade'.split(' '),
    departureDescription: (name: string) => `${name} heads out to the market promenade.`,
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
        augment_gruffInnkeeper(npcFactory({
          csvData: npcImports.get(NpcIds.GRUFF_INNKEEPER),
          character,
          vendorInventory: [
            ItemIds.BOTTLE_OF_BEER,
            ItemIds.BOTTLE_OF_GRAIN_SPIRIT,
            ItemIds.BOTTLE_OF_CHEAP_GRAIN_SPIRIT,
            ItemIds.BREAD_LOAF,
          ],
        })),
      ]);
    }

    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} has a look around at the other patrons of the inn.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`You look around the inn and see that it is quite a respectable establishment.  The clientele are presentable and well behaved, and the innkeeper, while gruff, clearly knows his business and keeps his wits about him.The door to the [south] leads back out to the market's [north promenade].`);
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
