import { navigateCharacter, writeCharacterStory } from '../../../sqlite/sqlite';
import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { navigate, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactories } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { handleFactionAggro } from '../../utils/combat';

const id: SceneIds = SceneIds.PARLIAMENT_SOUTH_PROMENADE;
const title: string = "Parliament Southern Promenade";
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
        npcFactories.get(NpcIds.GLOWERING_PEACEKEEPER)(),
        npcFactories.get(NpcIds.SNEERING_PEACEKEEPER)(),
      ]);
    } else {
      // Respawn logic
      characterNpcs.get(character.id).forEach(c => {
        if (c.deathTime && Date.now() - new Date(c.deathTime).getTime() > 600000) c.health = c.healthMax;
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
    emitOthers(`${name} looks around at the promenade.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`The southern promenade of Parliament's marketplace provides a calm, scenic place for folk to stroll and relax.  It is enveloped by a colorful garden and topped by a canopy of lush trees.  The south lies only a single storefront: a [bookstore] with a sign over the top reading "From Tales to Tomes".  The marketplace sprawls to your [east] and [west], and the marvelous [city square] lies to the north.`);
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    characterNpcs.get(character.id).forEach(npc => actorText.push(`You see ${npc.name} here.`));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  // normal travel, concise
  if (navigate(
    handlerOptions,
    SceneIds.PARLIAMENT_SOUTHWEST_MARKET,
    'w|west',
    emitOthers,
    `${name} walks west, to another part of the market.`,
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
