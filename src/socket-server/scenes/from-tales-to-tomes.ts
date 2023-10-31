import appendAlsoHereString from '../../utils/appendAlsoHereString';
import appendItemsHereString from '../../utils/appendItemsHereString';
import appendSentimentText from '../../utils/appendSentimentText';
import getEmitters from '../../utils/emitHelper';
import lookSceneItem from '../../utils/lookSceneItem';
import { handleNpcCommands, Navigable, navigate, SceneIds } from './scenes';
import { HandlerOptions } from '../server';
import { NPC, NpcIds, npcFactory } from '../npcs/npcs';
import { SceneSentiment, StoryState } from '../../types';
import { makeMatcher } from '../../utils/makeMatcher';
import { REGEX_LOOK_ALIASES } from '../../constants';
import { ItemIds } from '../items/items';
import { npcImports } from '../npcs/csvNpcImport';
import { augment_talesToTomesOwner } from '../npcs/tales-to-tomes-owner';
import { isAmbiguousNavRequest } from '../../utils/ambiguousRequestHelpers';

const id: SceneIds = SceneIds.FROM_TALES_TO_TOMES;
const title: string = "From Tales to Tomes";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = false;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.PARLIAMENT_SOUTH_PROMENADE,
    keywords: 'n north promenade southern'.split(' '),
    departureDescription: (name: string) => `${name} leaves the bookshop, exiting to the promenade.`,
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
        augment_talesToTomesOwner(npcFactory({
          csvData: npcImports.get(NpcIds.TALES_TO_TOMES_OWNER),
          character,
          vendorInventory: [
            ItemIds.THE_FIVE_REALMS_BOOK,
            ItemIds.IMPERIAL_GUIDE_BOOK,
            ItemIds.PERSONAL_GROWTH_BOOK,
            ItemIds.REALM_GUIDE_BOOK,
            ItemIds.FILSTREDS_GUIDE_BOOK,
          ],
        })),
      ]);
    }

    return handleSceneCommand({
      ...handlerOptions,
      command: 'look'
    })
  }

  if (handleNpcCommands(handlerOptions, filterNpcsByStory())) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES))) {
    emitOthers(`${name} looks around at all the books here.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    // This will be pushed to actor text independent of story
    actorText.push(`This bookstore is very well appointed, a luxury establishment worthy of Parliament's reputation.  The walls and furniture are of rich, deep reds and dark, lacquered woods, finished with finely chiseled patterns and moldings.  Set about the place are a number of cozy reading spaces, and the owner has provided tea and biscuits so that anyone purchasing books can have a comfortable home away from home to enjoy and discuss them.  The shelves sag with the weight of so many books, you almost can't even imagine them all having been written.  Books of all kinds: history, farming, warfare, religion, combat, the list goes on.  But a few catch your eye more than others.  The owner may be able to help guide you.  The exit to the [north] leads back out onto the southern promenade of Parliament's sprawling marketplace.`);
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
