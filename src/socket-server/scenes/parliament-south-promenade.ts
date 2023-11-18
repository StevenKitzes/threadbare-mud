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

const id: SceneIds = SceneIds.PARLIAMENT_SOUTH_PROMENADE;
const title: string = "Parliament Southern Promenade";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_SOUTHWEST_MARKET,
    keywords: 'w west market'.split(' '),
    departureDescription: (name: string) => `${name} walks west, to another part of the market.`,
  },
  {
    sceneId: SceneIds.FROM_TALES_TO_TOMES,
    keywords: 's south bookstore book store shop tales to tomes from'.split(' '),
    departureDescription: (name: string) => `${name} walks into From Tales to Tomes, a book shop.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_MARKET_SQUARE,
    keywords: 'n north market square'.split(' '),
    departureDescription: (name: string) => `${name} heads north, to the Market Square.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_SOUTHEAST_MARKET,
    keywords: 'e east market marketplace'.split(' '),
    departureDescription: (name: string) => `${name} heads east, deeper still into the market.`,
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
    
    handleFactionAggro(characterNpcs, character, handlerOptions, emitOthers, emitSelf);

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
    actorText.push(`The southern promenade of Parliament's marketplace provides a calm, scenic place for folk to stroll and relax.  It is enveloped by a colorful garden and topped by a canopy of lush trees.  To the south lies only a single storefront: a book store with a sign over the top reading [From Tales to Tomes].  The bustling marketplace sprawls to your [east] and [west], and the marvelous [Market Square] lies to the north.`);
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
