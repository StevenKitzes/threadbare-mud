import { REGEX_USE_ALIASES } from "../../constants";
import { EffectStat, StatEffect } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes } from "./items";

const id: ItemIds = ItemIds.GOOD_LUCK_CHARM;
const type: ItemTypes = ItemTypes.trinket;
const title: string = "a good luck charm";
const description: string = "A tiny, rustic, hand-made good luck charm that fits in the palm of your hand.  Hopefully this little trinket will always bring luck to whoever carries it.";
const keywords: string[] = ['good luck charm', 'lucky charm','charm'];
const value: number = 1;
const weight: number = 1;

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

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  handleItemCommand,
};
