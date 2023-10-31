import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { Navigable, SceneIds, handleNpcCommands, navigate } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { npcImports } from '../npcs/csvNpcImport';
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.PARLIAMENT_NORTHEAST_MARKET;
const title: string = "Parliament Northeastern Marketplace";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_NORTH_PROMENADE,
    keywords: "w west north promenade".split(' '),
    departureDescription: (name: string) => `${name} moves off west, toward the market's north promenade.`,
  },
  {
    sceneId: SceneIds.PARLIAMENT_MARKET_GATE,
    keywords: "s south market gate".split(' '),
    departureDescription: (name: string) => `${name} heads south, toward the Parliament Market Gate.`,
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
          csvData: npcImports.get(NpcIds.HUNTING_BOWYER),
          character,
          vendorInventory: [
            ItemIds.BUDGET_HUNTING_BOW, ItemIds.HUNTING_BOW, ItemIds.HUNTING_CROSSBOW,
          ],
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.KITSCHY_ENCHANTMENT_VENDOR),
          character,
          vendorInventory: [
            ItemIds.FLICKWRIST_BRACERS,
            ItemIds.STOUT_STANCE_BOOTS,
            ItemIds.EAGLE_EYE_SPECTACLES,
            ItemIds.QUICKSTEP_TROUSERS,
            ItemIds.STRONGSLEEVES_COAT,
            ItemIds.THINKING_CAP,
            ItemIds.FOESBANE_GLOVES,
            ItemIds.TRUESTRIKE_GLOVES,
            ItemIds.PROTECTION_CHARM,
            ItemIds.DEFTSTEP_BOOTS,
            ItemIds.SCALESKIN_JACKET,
          ],
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.SHOWY_SHIELDS_SHOPKEEPER),
          character,
          vendorInventory: [
            ItemIds.FLORAL_WOODEN_SHIELD,
            ItemIds.SHIELD_WITH_FILIGREE,
            ItemIds.BASIC_PAINTED_SHIELD,
          ],
        }),
      ]);
    }

    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around at the marketplace.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push("Here lies the northeastern corner of Parliament's grand marketplace.  Folk bustle about, heads turning this way and that to wonders and shouts from merchants peddling an eclectic mix of goods.  To the [west] of you lies a peaceful promenade, and to the [south] lies the Parliament Market Gate.");
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
