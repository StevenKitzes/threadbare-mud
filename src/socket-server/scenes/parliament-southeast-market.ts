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
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';
import { npcImports } from '../npcs/csvNpcImport';
import { augment_adv_guild_owner } from '../npcs/adv-guild-owner';

const id: SceneIds = SceneIds.PARLIAMENT_SOUTHEAST_MARKET;
const title: string = "Parliament Southeastern Market";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];
const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_MARKET_GATE,
    keywords: 'n north market gate'.split(' '),
    departureDescription: (name: string) => `${name} leaves northward, toward the Market Gate.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_SOUTH_PROMENADE,
    keywords: 'w west southern promenade'.split(' '),
    departureDescription: (name: string) => `${name} heads west, toward the market's southern promenade.`,
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
        augment_adv_guild_owner(npcFactory({
          csvData: npcImports.get(NpcIds.ADVENTURERS_GUILD_OWNER),
          character,
          vendorInventory: [
            ItemIds.LIGHT_LEATHER_CAP,
            ItemIds.LIGHT_LEATHER_VEST,
            ItemIds.LIGHT_LEATHER_TROUSERS,
            ItemIds.LIGHT_LEATHER_BOOTS,
            ItemIds.TRAVELING_KIT,
            ItemIds.TRAVEL_RATIONS,
          ]
        })),
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
    
    return true;
  }
  
  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;
  
  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {

    emitOthers(`${name} peruses the various offerings available in this part of the market.`);
    
    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`Here in the southeast corner of the market district is a tall, narrow building with a name emblazoned across the top of its door: The Adventurer's Guild.  You can tell at a glance, though, that it is less a guild, than a shop that has named itself "The Adventurer's Guild."  Tables have been set up outside under an awning with various goods that might be helpful to travelers.`);
    actorText.push(`To the [north] lies the architecturally impressive Market Gate.  To the [west] is the market's southern promenade.`);
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
