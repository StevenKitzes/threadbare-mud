import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { handleNpcCommands, Navigable, navigate, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { npcImports } from '../npcs/csvNpcImport';
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.PARLIAMENT_DECORATIVE_ARMORY;
const title: string = "Fine Parliamentary Armor";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = false;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_SOUTHWEST_MARKET,
    keywords: 'ne northeast market'.split(' '),
    departureDescription: (name: string) => `${name} leaves the armory to the northeast, returning to the market.`,
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
          csvData: npcImports.get(NpcIds.PARLIAMENTARY_DECORATIVE_SMITH),
          character,
          vendorInventory: [
            ItemIds.PARLIAMENT_GREAT_HELM,
            ItemIds.PARLIAMENT_ARMOR,
            ItemIds.PARLIAMENT_GAUNTLETS,
            ItemIds.PARLIAMENT_GREAVES,
            ItemIds.PARLIAMENT_BOOTS,
            ItemIds.PARLIAMENT_DECORATIVE_SWORD,
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
    emitOthers(`${name} gazes about at the fine armor on display.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`This establishment is tidy, but simple, focused on the quality of the armor pieces on display, which are among the finest you can imagine finding.  Smaller pieces - gauntlets and boots - rest on pillow-topped stands, while larger sets of armor are supported on padded mannequins.  Everything here gleams, polished to a mirror finish.  The one way in and out is a door that leads back out northeast, to the [market].`);
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
