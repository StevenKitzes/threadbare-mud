import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { SceneIds, navigate } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactories } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';

const id: SceneIds = SceneIds.IXPANNE_SOUTHWEST_MARKET;
const title: string = "Southwestern Marketplace";
const sentiment: SceneSentiment = SceneSentiment.neutral;
const horseAllowed: boolean = true;
const publicInventory: ItemIds[] = [];

const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);

  if (command === 'enter') {
    // Only relevant to scenes with npcs, to set up npc state
    if (!characterNpcs.has(character.id)) {
      // Populate NPCs
      characterNpcs.set(character.id, [
      ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.deathTime && Date.now() - new Date(c.deathTime).getTime() > 600000) c.health = c.healthMax;
      })
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

    const actorText: string[] = [title, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push("The southwestern reach of the marketplace is a den of opulence.  Other corners of the bazaar feature elegant and fancy offerings, certainly; but here stand the most prestigious shops.  In fact, vendors do not stand in the street with carts full of their wares, but rather take up residence ... in shops!");
    actorText.push("To the west, a boutique [jewelry shop] is tucked into the bottom floor of an upscale apartment building.  To the southwest lies an [armorer] specializing in dress and decorative pieces.  To the south you see a mysterious and somewhat spooky storefront, apparently kept by an [alchemist].  The rest of the marketplace sprawls onward to the north and east.");
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    characterNpcs.get(character.id).forEach(npc => actorText.push(npc.getDescription(character)));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (navigate(
    handlerOptions,
    SceneIds.IXPANNE_WEST_MARKET,
    "north|western market|west market",
    emitOthers,
    `${name} moves off north, toward the western part of the market.`,
  )) return true;

  return false;
}

export {
  id,
  title,
  sentiment,
  horseAllowed,
  publicInventory,
  handleSceneCommand
};
