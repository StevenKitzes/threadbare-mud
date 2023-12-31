import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { Navigable, SceneIds, navigate } from './scenes';
import { HandlerOptions } from '../server';
import { NPC } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.PARLIAMENT_SOUTHWEST_MARKET;
const title: string = "Parliament Southwestern Marketplace";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_WEST_MARKET,
    keywords: "n north market".split(' '),
    escapeKeyword: '[north]',
    departureDescription: (name: string) => `${name} moves off north, toward the western part of the market.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_SILVERSMITH,
    keywords: "w west silver shop silversmith boutique".split(' '),
    escapeKeyword: '[west]',
    departureDescription: (name: string) => `${name} walks into a silversmith's shop.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_ALCHEMY_SHOP,
    keywords: "s south alchemist alchemy shop".split(' '),
    escapeKeyword: '[south]',
    departureDescription: (name: string) => `${name} fades into the darkness of a mysterious alchemy shop.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_DECORATIVE_ARMORY,
    keywords: "sw southwest armory decorative armorer".split(' '),
    escapeKeyword: '[southwest]',
    departureDescription: (name: string) => `${name} walks into the decorative armory.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_SOUTH_PROMENADE,
    keywords: "e east southern promenade".split(' '),
    escapeKeyword: '[east]',
    departureDescription: (name: string) => `${name} walks away eastward, onto the marketplace's south promenade.`,
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
    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around at the marketplace.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push("The southwestern reach of the marketplace is a den of opulence.  Other corners of the bazaar feature elegant and fancy offerings, certainly; but here stand the most prestigious shops.  In fact, vendors do not stand in the street with carts full of their wares, but rather take up residence in dedicated storefronts.");
    actorText.push("To the west, a boutique [silversmith] is tucked into the bottom floor of an upscale apartment building.  To the southwest lies an [armorer] specializing in dress and decorative pieces.  To the south you see a mysterious, foreboding storefront, littered with vials and jars of hazy substances, perhaps kept by an [alchemist].  The rest of the marketplace sprawls onward to the [north], and [east] of here is a peaceful promenade.");
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);

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
