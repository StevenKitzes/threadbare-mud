import { writeCharacterData } from "../../../sqlite/sqlite";
import { CharacterUpdateOpts } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";

export type Item = {
  id: string;
  type: ItemTypes;
  title: string;
  description: string;
  keywords: string[];
  value: number;
  weight: number;
  armorValue?: number;
  damageValue?: number;
  damageType?: DamageType;
  hitBonus?: number;
  handleItemCommand?: (handlerOptions: HandlerOptions) => boolean;
  quest?: boolean;
};

export const items: Map<string, Item> = new Map<string, Item>();

export enum ItemTypes {
  trinket = "trinket",
  headgear = "headgear",
  armor = "armor",
  gloves = "gloves",
  legwear = "legwear",
  footwear = "footwear",
  offhand = "offhand",
  lightWeapon = "lightWeapon",
  heavyWeapon = "heavyWeapon",
  rangedWeapon = "rangedWeapon",
  consumable = "consumable"
};

export enum DamageType {
  slashing,
  piercing,
  bashing
}

export enum ItemIds {
  GOOD_LUCK_CHARM = "1",
  BLACK_HEADBAND = "2",
  LOOSE_BLACK_TUNIC = "3",
  LOOSE_BLACK_PANTS = "4",
  SOFT_BLACK_BOOTS = "5",
  SIMPLE_DAGGER = "6",
  AUDRICS_COIN_POUCH = "7",
  SMALL_ANVIL = "8",
  MEDIUM_ANVIL = "9",
  LARGE_ANVIL = "10",
  HUGE_ANVIL = "11",
  COLOSSAL_ANVIL = "12",
  SWEETROLL = "13",
  BREAD_LOAF = "14",
  CAKE = "15",
  APPLE = "16",
  ORANGE = "17",
  PLUM = "18",
  AVOCADO = "19",
  
}

{ // imports
  import('./good-luck-charm').then(item => items.set(item.id, item));
  import('./black-headband').then(item => items.set(item.id, item));
  import('./loose-black-tunic').then(item => items.set(item.id, item));
  import('./loose-black-pants').then(item => items.set(item.id, item));
  import('./soft-black-boots').then(item => items.set(item.id, item));
  import('./simple-dagger').then(item => items.set(item.id, item));
  import('./audrics-coin-pouch').then(item => items.set(item.id, item));
  import('./small-anvil').then(item => items.set(item.id, item));
  import('./medium-anvil').then(item => items.set(item.id, item));
  import('./large-anvil').then(item => items.set(item.id, item));
  import('./huge-anvil').then(item => items.set(item.id, item));
  import('./colossal-anvil').then(item => items.set(item.id, item));
  import('./sweetroll').then(item => items.set(item.id, item));
  import('./bread-loaf').then(item => items.set(item.id, item));
  import('./cake').then(item => items.set(item.id, item));
  import('./apple').then(item => items.set(item.id, item));
  import('./orange').then(item => items.set(item.id, item));
  import('./plum').then(item => items.set(item.id, item));
  import('./avocado').then(item => items.set(item.id, item));
}

export type ConsumeItemOpts = {
  handlerOptions: HandlerOptions;
  actionAliases: string;
  targetAliases: string;
  itemId: string;
  itemTitle: string;
  extraEffects?: (hanlerOptions: HandlerOptions, extraEffectsOpts: any) => CharacterUpdateOpts;
  extraEffectsOpts?: any;
}

export function consumeItem({
  handlerOptions,
  actionAliases,
  targetAliases,
  itemId,
  itemTitle,
  extraEffects,
  extraEffectsOpts,
}: ConsumeItemOpts): boolean {
  const { character, character: {name}, command, socket} = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  if (
    command.match(makeMatcher(actionAliases, targetAliases)) &&
    character.inventory.includes(itemId)
  ) {
    let characterUpdate: CharacterUpdateOpts = {};
    characterUpdate.health = Math.max(character.health_max, character.health + 10);
    characterUpdate.inventory = [ ...character.inventory ];
    characterUpdate.inventory.splice(character.inventory.indexOf(itemId), 1);

    if (extraEffects) {
      characterUpdate = extraEffects(handlerOptions, extraEffectsOpts);
    }

    if (writeCharacterData(character.id, characterUpdate)) {
      Object.keys(characterUpdate).forEach(key => character[key] = characterUpdate[key]);
      emitOthers(`${name} eats ${itemTitle}.`);
      emitSelf(`You enjoy ${itemTitle} and feel a little rejuvenated.`);
      return true;
    }
  }
}

export default items;
