import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_DRINK_ALIASES, REGEX_EAT_ALIASES, REGEX_USE_ALIASES } from "../../constants";
import { CharacterUpdateOpts } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";

export type Item = {
  id: ItemIds;
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
  healAmount?: number;
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
  consumable = "consumable",
  saddlebags = "saddlebags",
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
  ELEGANT_DOUBLET = "20",
  FASHIONABLE_BERET = "21",
  SUPPLE_LEATHER_GLOVES = "22",
  SOFT_WOOLEN_LEGGINGS = "23",
  STYLISH_BOOTS = "24",
  MODEST_SADDLEBAGS = "25",
  LEATHER_SADDLEBAGS = "26",
  REINFORCED_SAGGLEBAGS = "27",
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
  import('./elegant-doublet').then(item => items.set(item.id, item));
  import('./fashionable-beret').then(item => items.set(item.id, item));
  import('./supple-leather-gloves').then(item => items.set(item.id, item));
  import('./soft-woolen-leggings').then(item => items.set(item.id, item));
  import('./stylish-boots').then(item => items.set(item.id, item));
  import('./modest-saddlebags').then(item => items.set(item.id, item));
  import('./leather-saddlebags').then(item => items.set(item.id, item));
  import('./reinforced-saddlebags').then(item => items.set(item.id, item));
}

export type ConsumeItemOpts = {
  handlerOptions: HandlerOptions;
  actionAliases: string;
  targetAliases: string;
  itemId: ItemIds;
  itemTitle: string;
  extraEffects?: (hanlerOptions: HandlerOptions, extraEffectsOpts: any) => CharacterUpdateOpts;
  extraEffectsOpts?: any;
  healAmount?: number;
}

export function consumeItem({
  handlerOptions,
  actionAliases,
  targetAliases,
  itemId,
  itemTitle,
  extraEffects,
  extraEffectsOpts,
  healAmount,
}: ConsumeItemOpts): boolean {
  const { character, character: {name}, command, socket} = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  if (
    command.match(makeMatcher(actionAliases, targetAliases)) &&
    character.inventory.includes(itemId)
  ) {
    let characterUpdate: CharacterUpdateOpts = {};
    characterUpdate.health = Math.min(character.health_max, character.health + healAmount);
    characterUpdate.inventory = [ ...character.inventory ];
    characterUpdate.inventory.splice(character.inventory.indexOf(itemId), 1);

    if (extraEffects) {
      characterUpdate = extraEffects(handlerOptions, extraEffectsOpts);
    }

    if (writeCharacterData(character.id, characterUpdate)) {
      Object.keys(characterUpdate).forEach(key => character[key] = characterUpdate[key]);
      emitOthers(`${name} eats ${itemTitle}.`);

      let actionString: string;
      if (actionAliases === REGEX_DRINK_ALIASES) actionString = 'drink';
      if (actionAliases === REGEX_EAT_ALIASES) actionString = 'eat';
      if (actionAliases === REGEX_USE_ALIASES) actionString = 'use';

      let healString: string;
      if (healAmount < character.health_max * 0.1) healString = 'a little rejuvenated';
      else if (healAmount < character.health_max * 0.2) healString = 'quite rejuvenated';
      else if (healAmount < character.health_max * 0.3) healString = 'refreshed';
      else if (healAmount < character.health_max * 0.4) healString = 'very refreshed';
      else if (healAmount < character.health_max * 0.5) healString = 'revitalized';
      else if (healAmount < character.health_max * 0.6) healString = 'a healing effect';
      else if (healAmount < character.health_max * 0.7) healString = 'a strong healing effect';
      else if (healAmount < character.health_max * 0.8) healString = 'a powerful healing effect';
      else if (healAmount < character.health_max * 0.9) healString = 'your health almost completely restored';
      else if (healAmount < character.health_max) healString = 'fully reinvigorated';
      else healString = 'the Lifelight rushing into you, repairing all damage to your body';

      emitSelf(`You ${actionString} ${itemTitle} and feel ${healString}.`);
      return true;
    }
  }
}

export default items;
