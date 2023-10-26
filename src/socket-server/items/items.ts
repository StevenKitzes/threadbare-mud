import { writeCharacterData } from "../../../sqlite/sqlite";
import { ITEM_VALUE_RANDOMIZER_TIMER, REGEX_DRINK_ALIASES, REGEX_EAT_ALIASES, REGEX_USE_ALIASES } from "../../constants";
import { CharacterUpdateOpts, EffectStat, StatEffect, TemporaryEffect } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { commandMatchesKeywordsFor } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { augment_statPotion, augment_consumable } from "./consumable";

import { readItemCsv } from "./csvItemImport";
import { augment_book, augment_durable } from "./durable";

export type Item = {
  id: ItemIds;
  type: ItemTypes;
  title: string;
  description: string;
  keywords: string[];
  getValue: () => number;
  randomizeValue: () => number;
  weight: number;
  armorValue?: number;
  damageValue?: number;
  damageType?: DamageType;
  hitBonus?: number;
  handleItemCommand?: (handlerOptions: HandlerOptions) => boolean;
  quest?: boolean;
  healAmount?: number;
  consumeEffects?: TemporaryEffect[];
  statEffects?: StatEffect[];
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
  book = "book",
};

export enum DamageType {
  slashing = "slashing",
  piercing = "piercing",
  bashing = "bashing"
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
  STANDARD_BROADSWORD = "28",
  STANDARD_RAPIER = "29",
  LITTLE_THROWING_DAGGERS = "30",
  STANDARD_MACE = "31",
  LIGHT_LEATHER_CAP = "32",
  PADDED_LEATHER_ARMOR = "33",
  STURDY_LEATHER_GLOVES = "34",
  SPLINTED_LEATHER_LEGGINGS = "35",
  HEAVY_LEATHER_BOOTS = "36",
  SMALL_HEALING_POTION = "37",
  AGILITY_POTION = "38",
  STRENGTH_POTION = "39",
  SAVVY_POTION = "40",
  LIGHT_ATTACK_POTION = "41",
  HEAVY_ATTACK_POTION = "42",
  RANGED_ATTACK_POTION = "43",
  SILVER_CROWN = "44",
  SILVER_RINGS = "45",
  INSPIRING_SILVER_SCEPTER = "46",
  SILVER_DAGGER = "47",
  PARLIAMENT_GREAT_HELM = "48",
  PARLIAMENT_ARMOR = "49",
  PARLIAMENT_GAUNTLETS = "50",
  PARLIAMENT_GREAVES = "51",
  PARLIAMENT_BOOTS = "52",
  PARLIAMENT_DECORATIVE_SWORD = "53",
  BOTTLE_OF_BEER = "54",
  BOTTLE_OF_GRAIN_SPIRIT = "55",
  BOTTLE_OF_CHEAP_GRAIN_SPIRIT = "56",
  PEACEKEEPER_LONGSWORD = "57",
  BUDGET_HUNTING_BOW = "58",
  HUNTING_BOW = "59",
  HUNTING_CROSSBOW = "60",
  FLICKWRIST_BRACERS = "61",
  STOUT_STANCE_BOOTS = "62",
  EAGLE_EYE_SPECTACLES = "63",
  QUICKSTEP_TROUSERS = "64",
  STRONGSLEEVES_COAT = "65",
  THINKING_CAP = "66",
  FOESBANE_GLOVES = "67",
  TRUESTRIKE_GLOVES = "68",
  PROTECTION_CHARM = "69",
  DEFTSTEP_BOOTS = "70",
  SCALESKIN_JACKET = "71",
  FLORAL_WOODEN_SHIELD = "72",
  SHIELD_WITH_FILIGREE = "73",
  BASIC_PAINTED_SHIELD = "74",
  THE_FIVE_REALMS_BOOK = "75",
  IMPERIAL_GUIDE_BOOK = "76",
  PERSONAL_GROWTH_BOOK = "77",
  REALM_GUIDE_BOOK = "78",
  FILSTREDS_GUIDE_BOOK = "79",
  DEAD_RAT = "80",
}

readItemCsv(() => {
  // augmentation of simple consumable items
  augment_consumable(items.get(ItemIds.APPLE), REGEX_EAT_ALIASES);
  augment_consumable(items.get(ItemIds.AVOCADO), REGEX_EAT_ALIASES);
  augment_consumable(items.get(ItemIds.BOTTLE_OF_BEER), REGEX_DRINK_ALIASES, [
    {
      amount: -2,
      duration: 300000,
      name: "the mental affects of alcohol",
      stat: EffectStat.savvy
    },
    {
      amount: -2,
      duration: 600000,
      name: "the physical affects of alcohol",
      stat: EffectStat.agility
    }
  ]);
  augment_consumable(items.get(ItemIds.BOTTLE_OF_CHEAP_GRAIN_SPIRIT), REGEX_DRINK_ALIASES, [
    {
      amount: -4,
      duration: 1200000,
      name: "the mental affects of cheap spirit",
      stat: EffectStat.savvy
    },
    {
      amount: -4,
      duration: 1800000,
      name: "the physical affects of cheap spirit",
      stat: EffectStat.agility
    }
  ]);
  augment_consumable(items.get(ItemIds.BOTTLE_OF_GRAIN_SPIRIT), REGEX_DRINK_ALIASES, [
    {
      amount: -4,
      duration: 600000,
      name: "the mental affects of grain spirit",
      stat: EffectStat.savvy
    },
    {
      amount: -4,
      duration: 1200000,
      name: "the physical affects of grain spirit",
      stat: EffectStat.agility
    }
  ]);
  augment_consumable(items.get(ItemIds.BREAD_LOAF), REGEX_EAT_ALIASES);
  augment_consumable(items.get(ItemIds.CAKE), REGEX_EAT_ALIASES);
  augment_consumable(items.get(ItemIds.ORANGE), REGEX_EAT_ALIASES);
  augment_consumable(items.get(ItemIds.PLUM), REGEX_EAT_ALIASES);
  augment_consumable(items.get(ItemIds.SMALL_HEALING_POTION), REGEX_EAT_ALIASES);
  augment_consumable(items.get(ItemIds.SWEETROLL), REGEX_EAT_ALIASES);
  
  // augmentation of books
  augment_book(items.get(ItemIds.FILSTREDS_GUIDE_BOOK));
  augment_book(items.get(ItemIds.IMPERIAL_GUIDE_BOOK));
  
  // augmentation of durable items
  augment_durable(items.get(ItemIds.AUDRICS_COIN_POUCH), { quest: true });
  augment_durable(items.get(ItemIds.BUDGET_HUNTING_BOW), {
    statEffects: [
      {
        stat: EffectStat.agility,
        amount: -2
      },
      {
        stat: EffectStat.defense,
        amount: 2
      },
    ]
  });
  augment_durable(items.get(ItemIds.DEFTSTEP_BOOTS), {
    statEffects: [
      {
        stat: EffectStat.dodge,
        amount: 1
      },
    ]
  });
  augment_durable(items.get(ItemIds.FLICKWRIST_BRACERS), {
    statEffects: [
      {
        stat: EffectStat.lightAttack,
        amount: 1
      },
    ]
  });
  augment_durable(items.get(ItemIds.FOESBANE_GLOVES), {
    statEffects: [
      {
        stat: EffectStat.damage,
        amount: 1
      },
    ]
  });
  augment_durable(items.get(ItemIds.EAGLE_EYE_SPECTACLES), {
    statEffects: [
      {
        stat: EffectStat.rangedAttack,
        amount: 1
      },
    ]
  });
  augment_durable(items.get(ItemIds.HUNTING_BOW), {
    statEffects: [
      {
        stat: EffectStat.agility,
        amount: -2
      },
      {
        stat: EffectStat.defense,
        amount: 2
      },
    ]
  });
  augment_durable(items.get(ItemIds.HUNTING_CROSSBOW), {
    statEffects: [
      {
        stat: EffectStat.agility,
        amount: -4
      }, {
        stat: EffectStat.defense,
        amount: +4
      },
    ]
  });
  augment_durable(items.get(ItemIds.INSPIRING_SILVER_SCEPTER), {
    statEffects: [
      {
        stat: EffectStat.savvy,
        amount: 2,
      },
    ]
  });
  augment_durable(items.get(ItemIds.PROTECTION_CHARM), {
    statEffects: [
      {
        stat: EffectStat.defense,
        amount: 1,
      },
    ]
  });
  augment_durable(items.get(ItemIds.QUICKSTEP_TROUSERS), {
    statEffects: [
      {
        stat: EffectStat.agility,
        amount: 1,
      },
    ]
  });
  augment_durable(items.get(ItemIds.SCALESKIN_JACKET), {
    statEffects: [
      {
        stat: EffectStat.armor,
        amount: 1,
      },
    ]
  });
  augment_durable(items.get(ItemIds.STOUT_STANCE_BOOTS), {
    statEffects: [
      {
        stat: EffectStat.heavyAttack,
        amount: 1,
      },
    ]
  });
  augment_durable(items.get(ItemIds.STRONGSLEEVES_COAT), {
    statEffects: [
      {
        stat: EffectStat.strength,
        amount: 1,
      },
    ]
  });
  augment_durable(items.get(ItemIds.THINKING_CAP), {
    statEffects: [
      {
        stat: EffectStat.savvy,
        amount: 1,
      },
    ]
  });
  augment_durable(items.get(ItemIds.TRUESTRIKE_GLOVES), {
    statEffects: [
      {
        stat: EffectStat.accuracy,
        amount: 1,
      },
    ]
  });

  // augmentation of special items
  augment_statPotion(items.get(ItemIds.AGILITY_POTION), "agility", 100, 1, "When the sensation subsides, you feel your reflexes are sharper than before.");
  augment_statPotion(items.get(ItemIds.HEAVY_ATTACK_POTION), "heavy_attack", 100, 1, "When the sensation subsides, you feel your hands yearning to swing heavier weapons.");
  augment_statPotion(items.get(ItemIds.LIGHT_ATTACK_POTION), "light_attack", 100, 1, "When the sensation subsides, your hands feel eager to swing lighter weapons.");
  augment_statPotion(items.get(ItemIds.RANGED_ATTACK_POTION), "ranged_attack", 100, 1, "When the sensation subsides, your eyes seem more ready to pick out ranged targets at a distance.");
  augment_statPotion(items.get(ItemIds.SAVVY_POTION), "savvy", 100, 1, "When the sensation subsides, you feel your mind is a little more clear than before.");
  augment_statPotion(items.get(ItemIds.STRENGTH_POTION), "strength", 100, 1, "When the sensation subsides, you feel your muscles are more powerful than before.");
});

setInterval(() => {
  items.forEach(item => item.randomizeValue());
  console.log('Item values randomized.');
}, ITEM_VALUE_RANDOMIZER_TIMER);

export type ConsumeItemOpts = {
  item: Item,
  handlerOptions: HandlerOptions;
  actionAliases: string;
  extraEffects?: (hanlerOptions: HandlerOptions, extraEffectsOpts: any) => CharacterUpdateOpts;
  extraEffectsOpts?: any;
  healAmount?: number;
  consumeEffects?: TemporaryEffect[];
}

export function consumeItem({
  item,
  handlerOptions,
  actionAliases,
  extraEffects,
  extraEffectsOpts,
  healAmount,
  consumeEffects,
}: ConsumeItemOpts): boolean {
  const { character, character: {name}, command, socket} = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  if ( commandMatchesKeywordsFor(command, item.keywords, actionAliases) ) {
    let characterUpdate: CharacterUpdateOpts = {};
    characterUpdate.health = Math.min(character.health_max, character.health + healAmount);
    characterUpdate.inventory = [ ...character.inventory ];
    characterUpdate.inventory.splice(character.inventory.indexOf(item.id), 1);
    if (consumeEffects !== undefined) {
      characterUpdate.temporaryEffects = [];
      consumeEffects.forEach((effect: TemporaryEffect) => {
        characterUpdate.temporaryEffects.push(effect);
        emitSelf(`You feel ${effect.name} beginning to take effect...`);
        setTimeout(() => {
          for( let i = 0; i < character.temporaryEffects.length; i++) {
            if (
              character.temporaryEffects[i].name === effect.name &&
              character.temporaryEffects[i].amount === effect.amount &&
              character.temporaryEffects[i].stat === effect.stat
            ) {
              character.temporaryEffects.splice(i, 1);
              emitSelf(`You sense ${effect.name} wearing off...`);
            }
          }
        }, effect.duration);
      })
    }

    if (extraEffects) {
      characterUpdate = extraEffects(handlerOptions, extraEffectsOpts);
    }

    if (writeCharacterData(character, characterUpdate)) {
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
      
      emitOthers(`${name} ${actionString}s ${item.title}.`);
      emitSelf(`You ${actionString} ${item.title} and feel ${healString}.`);
      return true;
    }
  }
}

export default items;
