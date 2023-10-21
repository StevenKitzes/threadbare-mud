import { REGEX_READ_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { captureFrom } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.IMPERIAL_GUIDE_BOOK;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = `A book titled [${title}].  It is beaten and worn, the spine threatening to let go of several pages, and has clearly been flipped through many, many times.`;
const keywords: string[] = ['book', 'field guide', 'field guide for soldiers', 'imperial guide', 'guide', 'guide for soldiers', 'imperial guide'];
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
      actorText.push(`"Your survival in the field will necessitate a clear understanding of your surroundings, your situation, and yourself.  How you observe and interpret your situation will directly correlate to your ability to thrive in and respond to that situation.  Thus, this manual prescribes a method of interpretation by which you can better evaluate any given situation and be able to expect superior results from your actions on it."`);
      actorText.push(`"When you observe things, it goes without saying that you would like as much information about those things as possible.  This will allow you to make the best possible decisions about how to interact with those things.  However, not all things can be reduced to simple, comparable numbers.  Sometimes, you must appreciate the context in which you are observing a thing to best understand it."`);
      actorText.push(`"An easy example of this is your weapon's effectiveness.  When you strike an enemy with your weapon, that enemy's reaction might differ from that of another enemy.  This is despite the fact that you are using the same weapon, and may have inflicted the same amount of injury.  We can attribute this difference to the context.  Enduring the same sort of sword wound, for example, a dog can reasonably be expected to react differently than a bear.  And so, when you see a dog behave as if he is on the edge of death at the slash of your blade, do not expect a bear to behave the same."`);
      actorText.push(`"Likewise, when you receive wounds of your own, or undergod the healing process, you will find the same phenomenon taking place.  As a recruit with a weak constitution, you may find the healing properties of a rejuvenative potion to be overwhelmingly refreshing.  As a hardened veteran with more scars, you may be able to endure more punishment, but this means the same healing draft will also restore less of your total bodily condition."`);
      actorText.push(`"Be wary of your context, and how these effects on you and your situation change over time."`);
      actorText.push(`The book continues with specifics of technique and wilderness survival that your are relieved to discover you are already familiar with.`);
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
