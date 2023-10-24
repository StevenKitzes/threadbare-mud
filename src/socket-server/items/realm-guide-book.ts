import { REGEX_READ_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { captureFrom } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import items, { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.REALM_GUIDE_BOOK;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = `A book titled [${title}].  It looks to be on the newer side, suggesting it was recently enough printed to be of relevance.`;
const keywords: string[] = csvItemToKeywords(csvData);
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, command, socket } = handlerOptions;
  const { name, scene_id: sceneId } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  const readMatch: string | null = captureFrom(command, REGEX_READ_ALIASES);
  if (readMatch !== null) {
    if (keywords.includes(readMatch)) {
      const actorText: string[] = [];
      actorText.push(`You open a copy of ${title}, skipping to the good bits...`);
      actorText.push(`"The peoples of this land are divided into realms - or, more colloquially, nations.  These nations and their relationships form the foundation upon which the game of contemporary politics is played.  Over time, borders and relationships - and, it can surely be said, even peoples - doubtless can and do change.  Yesterday, they were one way; tomorrow, they will be another; but today's reader, and perhaps a future reader interested in a contemporary take, will want to know more about the way things stand in the moment, and thus this work is born."`);
      actorText.push(`"May we begin in the north, with the Empire of the Sky.  As its name suggests, it is an empire, a military entity at its core, interested in the governance of its constituent entities of state, be they cities, duchies, nations, or what have you.  While these possess limited local authority to proceed with life as they see fit, the constant presence of imperial military personnel are a close reminder that heavy taxes loom with every harvest and that military service will be expected of the men - and, you may be surprised to know, the women - of every village, however small.  After all, the Empire's second interest is, to the surprise of none, expansion.  It may go without saying that a military machine capable of both expansion and the maintenance of a large, existing empire requires tremendous resources.  By way of simple geography, the Empire of the Sky spans the width of the entire continent - the only realm to do so - though only between the mountains in the far north and the inland sea."`);
      actorText.push(`"To the east of the inland sea, nestled between it and the mountains to the east, and spreading south around the shores of said inland sea, lies the kingdom realm of Thayzhul.  Here live the Weavers, most famous of her denizens, though not her only ones.  Here, magic is fostered, and a strict sense of morality and justice - a code, if you will.  It is, of course, no one's code but theirs, however; and the desires of others may or may not factor into it where politics are concerned.  While there has been much conflict and infighting among the royal family over the years, none argue that Thayzhul has done more than any other realm to keep the wild things of the uncivilized lands to the far east and south at bay, keeping the civilized realms safe from invasion - unless it is by each other.  Thayzhul is known in its own northern reaches for defending the local folk from the Empire of the Sky by way of intimidation if not by brute force, though in some eyes, the kingdom's methods make it no better than an eastern imperial equivalent."`);
      actorText.push(`"At last, we have the so-called Five Realms of the Drear in the west.  To be precise, this name is in some ways inaccurate - as discussed at greater length in my wonderful companion text, '${items.get(ItemIds.THE_FIVE_REALMS_BOOK).title}.  In short, however, we can say that Thayzhul and the Empire of the Sky both regard the Five Realms as one, which they both consider to be inferior, both to themselves and each other.  This is true, doubtless, in terms of size and population.  Only if the Five Realms are taken as a whole would they be on par with the two largest realms.  However, the Five Realms are fractured and distracted by hyperlocal interests.  This, on top of the fact that none of the Five Realms places emphasis, as a cultural or national whole, on either military prowess or magical development, is how the greater region earned the nickname 'The Drear', given by others but adopted within."`);
      actorText.push(`The book begins a much deeper dive into the contemporary politics, geography, economics, religions, and other aspects of the realms.`);
      emitOthers(`${name} opens a copy of ${title} and starts reading.`);
      emitSelf(actorText);
      return true;
    }
  }
};

function randomizeValue (): number {
  return value = itemPriceRandomizer(csvData.value);
}

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  randomizeValue,
  weight,
  handleItemCommand
};
