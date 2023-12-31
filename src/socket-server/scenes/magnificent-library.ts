import { REGEX_LOOK_ALIASES } from "../../constants";
import { SceneSentiment } from "../../types";
import { isAmbiguousNavRequest } from "../../utils/ambiguousRequestHelpers";
import appendAlsoHereString from "../../utils/appendAlsoHereString";
import appendItemsHereString from "../../utils/appendItemsHereString";
import getEmitters from "../../utils/emitHelper";
import lookSceneItem from "../../utils/lookSceneItem";
import { commandMatchesKeywordsFor, makeMatcher } from "../../utils/makeMatcher";
import { ItemIds } from "../items/items";
import { augment_audric } from "../npcs/audric";
import { npcImports } from "../npcs/csvNpcImport";
import { NPC, NpcIds, npcFactory } from "../npcs/npcs";
import { HandlerOptions } from "../server";
import { Navigable, SceneIds, handleNpcCommands, navigate } from "./scenes";

const id: SceneIds = SceneIds.MAGNIFICENT_LIBRARY;
const title: string = "A marvelous library";
const sentiment: SceneSentiment = SceneSentiment.remote;
const horseAllowed: boolean = false;
const publicInventory: ItemIds[] = [];

const navigables: Navigable[] = [
  {
    sceneId: SceneIds.COLD_BEDROOM,
    keywords: 'door heavy wooden'.split(' '),
    escapeKeyword: 'through a wooden [door]',
    departureDescription: (name: string) => `${name} departs through a heavy wooden door.`,
    extraActionAliases: 'open',
  },
  {
    sceneId: SceneIds.CURVING_STONE_STAIRCASE,
    keywords: 'stairs stairway staircase steps'.split(' '),
    escapeKeyword: '[down] the stairs',
    departureDescription: (name: string) => `${name} heads down a curving stone staircase.`,
  },
];

const characterNpcs: Map<string, NPC[]> = new Map<string, NPC[]>();
const getSceneNpcs = (): Map<string, NPC[]> => characterNpcs;

const handleSceneCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, characterList, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, sceneId);
  console.log('call')
  console.log('command', command)

  const filterNpcsByStory = (): NPC[] => {
    const npcs: NPC[] | null = characterNpcs.get(character.id);
    if (npcs === null) return [];
    return npcs.filter(npc => {
      return true;
    })
  }

  if (command === 'enter') {
    emitOthers(`${character.name} enters the library.`);

    if (!characterNpcs.has(character.id)) {
      // Populate NPCs
      characterNpcs.set(character.id, [
        augment_audric(npcFactory({
          csvData: npcImports.get(NpcIds.AUDRIC),
          character,
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
    emitOthers(`${name} looks around the library.`);

    const actorText: string[] = [`{${title}}`, '- - -'];
    
    actorText.push("The arched ceiling soars high overhead, obscured in darkness.  The [bookshelves] lining the walls of this circular room rise into those same shadows.  Light of every color streams into the main part of the library through stained glass windows, and motes of dust hang in the air, sparkling and shimmering.  Luxurious pillows and upholstery line the elaborate furnishings - though the vivacity of the scene is dulled a bit by a thin layer of dust that lies over everything.  The number and variety of the library's many [books] and [scrolls] is also impressive.  They are stacked on tables and desks in piles, disorderly but not quite discarded.");
    actorText.push("Aside from the [heavy wooden door] you first used to enter this room, there are a few others, but for now they are all locked.  You can also go down a curving stone [staircase].");
    appendAlsoHereString(actorText, character, characterList);
    appendItemsHereString(actorText, id);
    filterNpcsByStory().forEach(npc => actorText.push(npc.getDescription()));

    emitSelf(actorText);

    return true;
  }

  if (lookSceneItem(command, publicInventory, character.name, emitOthers, emitSelf)) return true;
  
  if (commandMatchesKeywordsFor(command, ['bookshelves', 'bookshelf', 'book', 'shelf', 'shelves'], REGEX_LOOK_ALIASES)) {
    emitOthers(`${name} gazes up at the soaring bookshelves.`);
    emitSelf("If they weren't crafted from stout and heavy woods themselves, these shelves would sag with the weight of thousands of weighty volumes.  The collection is beyond impressive.  Old books, newer books, books with pages missing and others with extra pages stuffed in.  Books on the magical, the mundane, the medical and the technical, on the artistic, the philosophical, on the mathmatical and even the comedic.  In languages you don't know and have never heard of.");
    return true;
  }

  if (commandMatchesKeywordsFor(command, ['books', 'tomes', 'volumes'], REGEX_LOOK_ALIASES)) {
    emitOthers(`${name} peruses the stacks of discarded books.`);
    emitSelf("It is amazing how many books are piled on the tables and desks.  Some have clearly been used more recently than others, as told by the varying thickness of the dust on their covers.  Some lie open, while others have bookmarks tucked between their pages.  The library seems active, if only just.");
    return true;
  }

  if (commandMatchesKeywordsFor(command, ['scrolls'], REGEX_LOOK_ALIASES)) {
    emitOthers(`${name} casts an eye to the scrolls littering the library.`);
    emitSelf("Scrolls lie amid the books.  Some are tied with ribbon, others with twine, others curled shut only because that is how they look to have spent hundreds of their long years.  The runes scrawled over their surfaces provide no hint to the casual observer as to their meanings.");
    return true;
  }

  if (commandMatchesKeywordsFor(command, ['door', 'heavy', 'wooden'], REGEX_LOOK_ALIASES)) {
    emitOthers(`${name} inspects a heavy wooden door.`);
    emitSelf("The door is near twice as tall as it needs to be for someone to pass comfortably through, and wider than necessary, as well.  A mark of luxury?  You wouldn't think so, considering the crude iron binding that holds it together, or the lack of any ornamentation.");
    return true;
  }

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
};

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
