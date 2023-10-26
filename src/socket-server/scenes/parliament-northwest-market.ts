import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { SceneIds, navigate } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { npcImports } from '../npcs/csvNpcImport';
import { augment_stablemaster } from '../npcs/stablemaster';

const id: SceneIds = SceneIds.PARLIAMENT_NORTHWEST_MARKET;
const title: string = "Parliament Northwestern Marketplace";
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
          csvData: npcImports.get(NpcIds.HUMBLE_BLACKSMITH),
          character,
          vendorInventory: [
            ItemIds.STANDARD_BROADSWORD,
            ItemIds.STANDARD_RAPIER,
            ItemIds.LITTLE_THROWING_DAGGERS,
            ItemIds.STANDARD_MACE,
          ],
        }),
        augment_stablemaster(npcFactory({
          csvData: npcImports.get(NpcIds.STABLEMASTER),
          character,
          vendorInventory: [
            ItemIds.MODEST_SADDLEBAGS,
            ItemIds.LEATHER_SADDLEBAGS,
            ItemIds.REINFORCED_SAGGLEBAGS,
          ],
        })),
        npcFactory({
          csvData: npcImports.get(NpcIds.LEATHER_WORKER),
          character,
          vendorInventory: [
            ItemIds.LIGHT_LEATHER_CAP,
            ItemIds.PADDED_LEATHER_ARMOR,
            ItemIds.STURDY_LEATHER_GLOVES,
            ItemIds.SPLINTED_LEATHER_LEGGINGS,
            ItemIds.HEAVY_LEATHER_BOOTS,
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
    actorText.push("You wander the northwestern area of a grand marketplace.  The sounds and smells here are different than in the rest of the bazaar.  In place of shopkeepers, here you find metalworkers and craftsmen.  Folk still bustle about here as they do elsewhere in the market, but the ringing of steel and the roar of the forge take over for shouting merchants.  To the [east] is a peaceful promenade, and to the [south] you see the market sprawling onward.");
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
    SceneIds.PARLIAMENT_WEST_MARKET,
    "s south market".split(' '),
    emitOthers,
    `${name} moves off south, toward the western part of the market.`,
  )) return true;

  if (navigate(
    handlerOptions,
    SceneIds.PARLIAMENT_NORTH_PROMENADE,
    "e east northern promenade".split(' '),
    emitOthers,
    `${name} moves off east, toward the market's north promenade.`,
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
