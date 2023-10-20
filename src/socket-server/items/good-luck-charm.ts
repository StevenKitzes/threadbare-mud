import { REGEX_USE_ALIASES } from "../../constants";
import { EffectStat, StatEffect } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { itemPriceRandomizer } from "../../utils/itemPriceRandomizer";
import { makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemImport, itemImports } from "./csvItemImport";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.GOOD_LUCK_CHARM;
const csvData: ItemImport = itemImports.get(id);
const type: ItemTypes = csvData.type;
const title: string = csvData.title;
const description: string = "A tiny, rustic, hand-made [good luck charm] that fits in the palm of your hand.  Hopefully this little trinket will always bring luck to whoever carries it.";
const keywords: string[] = ['good luck charm', 'lucky charm','charm'];
let value: number = itemPriceRandomizer(csvData.value);
const weight: number = csvData.weight;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  const { character, command, socket } = handlerOptions;
  const { name } = character;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  if (command.match(makeMatcher(REGEX_USE_ALIASES, keywords.join('|')))) {
    if (character.offhand === id) {
      emitOthers(`${name}'s ${title} glimmers and glows.`);
      emitSelf(`You feel ${title}'s warmth and see it glow in your hand!`);
      return true;
    } else {
      emitSelf(`You can only use ${title} if you [equip] it.`);
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
  handleItemCommand,
};
