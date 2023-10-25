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
import { handleFactionAggro } from '../../utils/combat';
import { npcImports } from '../npcs/csvNpcImport';

const id: SceneIds = SceneIds.PARLIAMENT_WEST_MARKET;
const title: string = "Parliament Western Marketplace";
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
          csvData: npcImports.get(NpcIds.BAKER),
          character,
          vendorInventory: [
            ItemIds.BREAD_LOAF, ItemIds.SWEETROLL, ItemIds.CAKE
          ],
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.FRUIT_VENDOR),
          character,
          vendorInventory: [
            ItemIds.ORANGE, ItemIds.AVOCADO, ItemIds.PLUM, ItemIds.APPLE
          ],
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.LUXURY_CLOTHIER),
          character,
          vendorInventory: [
            ItemIds.FASHIONABLE_BERET,
            ItemIds.ELEGANT_DOUBLET,
            ItemIds.SUPPLE_LEATHER_GLOVES,
            ItemIds.SOFT_WOOLEN_LEGGINGS,
            ItemIds.STYLISH_BOOTS,
          ],
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.GLOWERING_PEACEKEEPER),
          character,
        }),
      ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.getDeathTime() && Date.now() - new Date(c.getDeathTime()).getTime() > 600000) c.setHealth(c.getHealthMax());
      })
    }

    handleFactionAggro(characterNpcs, character, handlerOptions, emitOthers, emitSelf);

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
    actorText.push("You stand along the western edge of a grand marketplace, busy with people buying and selling all kinds of things.  The sounds, smells, and sights here dazzle the senses, with food, animals, colors, art; you name it, you can probably find it here.  To the east you see a broad, open [town square].  To the west lies [Audric's tower].  To the [north] and [south] the marketplace sprawls onward.");
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
    SceneIds.OUTSIDE_AUDRICS_TOWER,
    "w|tower|audric's tower|west",
    emitOthers,
    `${name} moves off toward Audric's tower.`,
  )) return true;

  if (navigate(
    handlerOptions,
    SceneIds.PARLIAMENT_NORTHWEST_MARKET,
    "n|north",
    emitOthers,
    `${name} moves off northward into another part of the market.`,
  )) return true;

  if (navigate(
    handlerOptions,
    SceneIds.PARLIAMENT_SOUTHWEST_MARKET,
    "s|south",
    emitOthers,
    `${name} moves off southward into another part of the market.`,
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
