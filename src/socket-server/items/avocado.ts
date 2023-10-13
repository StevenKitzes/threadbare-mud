import { REGEX_EAT_ALIASES } from "../../constants";
import { HandlerOptions } from "../server";
import { ItemIds, ItemTypes, consumeItem } from "./items";

const id: ItemIds = ItemIds.AVOCADO;
const type: ItemTypes = ItemTypes.consumable;
const title: string = "an avocado";
const description: string = "A rare delicacy, this avocado is ripe and just the right texture.";
const keywords: string[] = ['avocado', 'ripe avocado'];
const value: number = 8;
const weight: number = 1;

const handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
  if (consumeItem({
    handlerOptions,
    actionAliases: REGEX_EAT_ALIASES,
    targetAliases: keywords.join('|'),
    itemId: id,
    itemTitle: title
  })) return true;

  return false;
};

export {
  id,
  type,
  title,
  description,
  keywords,
  value,
  weight,
  handleItemCommand
};
