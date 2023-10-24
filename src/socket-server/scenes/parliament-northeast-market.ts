import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { SceneIds, navigate } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory, npcFactories } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { npcImports } from '../npcs/csvNpcImport';

const id: SceneIds = SceneIds.PARLIAMENT_NORTHEAST_MARKET;
const title: string = "Parliament Northeastern Marketplace";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();
const getSceneNpcs = (): Map<string, NPC[]> => characterNpcs;

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

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

  // Only relevant to scenes with npcs, delete otherwise
  const sceneNpcs: NPC[] = characterNpcs.get(character.id);
  for (let i = 0; i < sceneNpcs.length; i++) if (sceneNpcs[i].handleNpcCommand(handlerOptions)) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around at the marketplace.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push("Here lies the northeastern corner of Parliament's grand marketplace.  Folk bustle about, heads turning this way and that to wonders and shouts from merchants peddling an eclectic mix of goods.  To the [west] of you lies the market's north promenade, and [south] lies the Parliament Market Gate.");
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    characterNpcs.get(character.id).forEach(npc => actorText.push(npc.getDescription()));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (navigate(
    handlerOptions,
    SceneIds.PARLIAMENT_NORTH_PROMENADE,
    "w|west|north promenade|promenade",
    emitOthers,
    `${name} moves off west, toward the market's north promenade.`,
  )) return true;

  return false;
}

export {
  id,
  title,
  sentiment,
  horseAllowed,
  publicInventory,
  handleSceneCommand,
  getSceneNpcs
};
