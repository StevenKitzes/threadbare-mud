import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { navigate, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { handleFactionAggro } from '../../utils/combat';
import { npcImports } from '../npcs/csvNpcImport';

const id: SceneIds = SceneIds.PARLIAMENT_NORTH_PROMENADE;
const title: string = "Parliament Northern Promenade";
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
          csvData: npcImports.get(NpcIds.SNEERING_PEACEKEEPER),
          character,
        }),
        npcFactory({
          csvData: npcImports.get(NpcIds.SCOWLING_PEACEKEEPER),
          character,
        }),
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
    })

    handleFactionAggro(characterNpcs, character, handlerOptions, emitOthers, emitSelf);

    return true;
  }

  // Only relevant to scenes with npcs, delete otherwise
  const sceneNpcs: NPC[] = characterNpcs.get(character.id);
  for (let i = 0; i < sceneNpcs.length; i++) if (sceneNpcs[i].handleNpcCommand(handlerOptions)) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around at the promenade.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`This part of the market is kept free of shops and stalls, meant to provide a calmer promenade.  It is a place for folk to stroll about or relax in the shade of trees on benches.  Peacekeepers, the city guard of Parliament, pass by on occasion.  To the north lies an inn and tavern with a sign over the door reading The [Parliament Market Inn].  To the [south], the beautiful, open Market Square spreads before you.  To the [east] and [west], the busting marketplace sprawls onward.`);
    appendSentimentText(character.job, sentiment, actorText);
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    // Only relevant to scenes with npcs, delete otherwise
    characterNpcs.get(character.id).forEach(npc => actorText.push(npc.getDescription()));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  // normal travel, concise
  if (navigate(
    handlerOptions,
    SceneIds.PARLIAMENT_NORTHWEST_MARKET,
    'w west'.split(' '),
    emitOthers,
    `${name} walks west, to another part of the market.`,
  )) return true;

  if (navigate(
    handlerOptions,
    SceneIds.PARLIAMENT_NORTHEAST_MARKET,
    'e east'.split(' '),
    emitOthers,
    `${name} walks east, to another part of the market.`,
  )) return true;

  if (navigate(
    handlerOptions,
    SceneIds.PARLIAMENT_MARKET_INN,
    'n north inn market parliament'.split(' '),
    emitOthers,
    `${name} steps into the Parliament Market Inn to the north.`,
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
