import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { navigate, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory, npcFactories } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { npcImports } from '../npcs/csvNpcImport';

const id: SceneIds = SceneIds.PARLIAMENT_SILVERSMITH;
const title: string = "Parliament Silversmith";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = false;
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
          csvData: npcImports.get(NpcIds.CIVILIZED_SILVERSMITH),
          character,
          vendorInventory: [
            ItemIds.SILVER_CROWN, ItemIds.SILVER_RINGS, ItemIds.INSPIRING_SILVER_SCEPTER, ItemIds.SILVER_DAGGER
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
    emitOthers(`${name}`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`The shop is clean and tidy, with silver jewelry, tableware, and even some decorative weapons.  All the items for sale are displayed on velvet pillows for an added element of luxury.  Fine curtains decorate the walls, and there is even a bit of stained glass set into some of the windows.  The front door leads out to the east, back into the [market].`);
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
    SceneIds.PARLIAMENT_SOUTHWEST_MARKET,
    'e|east|door|front door|market',
    emitOthers,
    `${name} leaves the silver shop to return to the market outside.`,
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
