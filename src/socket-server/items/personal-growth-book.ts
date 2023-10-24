import { REGEX_READ_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { csvItemToKeywords } from "../../utils/csvPropsToKeywords";
import { captureFrom } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.PERSONAL_GROWTH_BOOK;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = `A book titled [${title}].  To your surprise, a quick rifle through the pages gives the impression of some very useful information.`;
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
      actorText.push(`"Your relationship with the Lifelight is one of reverence, yes, but also one of eternal personal growth and development.  The Lifelight wants to shine on you, yes, and in so doing, better you, foster your journey with its warmth and energy.  Have you ever wondered how to make the most of this relationship?"`);
      actorText.push(`"You are a being, blessed, yes, with the Lifelight, and thus, capable of doing many things, so many things.  But how can you determine what you are best at?  You may want to [evaluate skills] that are relevant to your job, your health, or your relationships.  By keeping an eye on your [skills], you can maintain awareness of what sort of progress you have made in sharpening each of them.  Never forget, no, that you are better off comparing yourself with only yourself, and where you want yourself to be in your own future, rather than comparing yourself with others, or trying to quantify your skills.  What folly!"`);
      actorText.push(`"Over time, as you work on your skills and on yourself, the Lifelight will bless you with gifts of its warmth and its energy.  Your body will carry this energy with it, yes, and over time accumulate it in greater amounts.  You will feel it in your living flesh, yes, its [level] will rise within you!  As your journey through life progresses, you will find that you can channel this energy into the growth of your skills.  Pray that the Lifelight might lift the [level] of your skills and abilities to the level needed to meet your purpose!"`);
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
