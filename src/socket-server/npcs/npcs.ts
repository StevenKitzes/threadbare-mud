import { allTokensMatchKeywords, captureFrom, captureSellTo, commandMatchesKeywordsFor } from "../../utils/makeMatcher";
import { Character, CharacterUpdateOpts, Faction } from "../../types";
import items, { Item, ItemIds } from "../items/items";
import { HandlerOptions } from "../server";
import { csvNpcToKeywords } from "../../utils/csvPropsToKeywords";
import { writeCharacterData } from "../../../sqlite/sqlite";
import { NpcImport, readNpcCsv } from "./csvNpcImport";
import { REGEX_BUY_ALIASES, REGEX_FIGHT_ALIASES, REGEX_LOOK_ALIASES, REGEX_SELL_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import startCombat from "../../utils/combat";
import { coinValueRandomizer } from "../../utils/coinValueRandomizer";
import { SceneIds } from "../scenes/scenes";

export type NPC = {
  private: {
    id: NpcIds;    
    name: string;

    aggro: boolean;
    agility: number;
    armor: number;
    armorType: ArmorType[];
    attackDescription: string;
    cashLoot: number;
    characterRef: Character;
    combatInterval: NodeJS.Timeout | null;
    damageValue: number;
    deathTime: number;
    description: string;
    faction: Faction;
    health: number;
    healthMax: number;
    itemLoot: ItemIds[];
    keywords: string[];
    saleItems: Item[];
    savvy: number;
    sceneId: SceneIds;
    strength: number;
    talkText: string;
    xp: number;
  };

  // these are not settable
  getId: () => NpcIds;
  getName: () => string;
  getKeywords: () => string[];
  getSceneId: () => SceneIds;
  
  // these are settable
  getAggro: () => boolean;
  setAggro: (a: boolean) => void;

  getAgility: () => number;
  setAgility: (a: number) => void;

  getArmor: () => number;
  setArmor: (a: number) => void;

  getArmorType: () => ArmorType[];
  setArmorType: (a: ArmorType[]) => void;

  getAttackDescription: () => string;
  setAttackDescription: (a: string) => void;

  getCashLoot: () => number;
  setCashLoot: (c: number) => void;

  // characterRef is not gettable or settable, it is purely internal; only a factory should set it initially

  getCombatInterval: () => NodeJS.Timeout | null;
  setCombatInterval: (c: NodeJS.Timeout | null) => void;

  getDamageValue: () => number;
  setDamageValue: (d: number) => void;

  getDeathTime: () => number;
  setDeathTime: (d: number) => void;

  getDescription: () => string;
  setDescription: (d: string) => void;

  getFaction: () => Faction;
  setFaction: (f: Faction) => void;

  getHealth: () => number;
  setHealth: (h: number) => void;

  getHealthMax: () => number;
  setHealthMax: (h: number) => void;

  getItemLoot: () => ItemIds[];
  setItemLoot: (i: ItemIds[]) => void;

  getSaleItems: () => Item[];
  setSaleItems: (s: Item[]) => void;
  
  getSavvy: () => number;
  setSavvy: (s: number) => void;
  
  getStrength: () => number;
  setStrength: (s: number) => void;
  
  getTalkText: () => string;
  setTalkText: (t: string) => void;

  getXp: () => number;
  setXp: (x: number) => void;

  handleNpcCustom: (handlerOptions: HandlerOptions) => boolean;
  handleNpcLook: (handlerOptions: HandlerOptions) => boolean;
  handleNpcLookSaleItem: (handlerOptions: HandlerOptions) => boolean;
  handleNpcGive: (handlerOptions: HandlerOptions) => boolean;
  handleNpcTalk: (handlerOptions: HandlerOptions) => boolean;
  handleNpcPurchase: (handlerOptions: HandlerOptions) => boolean;
  handleNpcSell: (handlerOptions: HandlerOptions) => boolean;
  handleNpcFight: (handlerOptions: HandlerOptions) => boolean;
};

export enum ArmorType {
  strongVsSlashing = "strongVsSlashing",
  strongVsPiercing = "strongVsPiercing",
  strongVsBashing = "strongVsBashing",
  weakVsSlashing = "weakVsSlashing",
  weakVsPiercing = "weakVsPiercing",
  weakVsBashing = "weakVsBashing"
};

export enum NpcIds {
  AUDRIC = "1",
  SMALL_RAT = "2",
  STOUT_RAT = "3",
  RABID_RAT = "4",
  BAKER = "5",
  FRUIT_VENDOR = "6",
  LUXURY_CLOTHIER = "7",
  STABLEMASTER = "8",
  HUMBLE_BLACKSMITH = "9",
  LEATHER_WORKER = "10",
  ALCHEMIST_GNARLED_BEYOND_HIS_YEARS = "11",
  CIVILIZED_SILVERSMITH = "12",
  PARLIAMENTARY_DECORATIVE_SMITH = "13",
  GRUFF_INNKEEPER = "14",
  SNEERING_PEACEKEEPER = "15",
  SCOWLING_PEACEKEEPER = "16",
  GLOWERING_PEACEKEEPER = "17",
  PEACEKEEPER_CAPTAIN = "18",
  HUNTING_BOWYER = "19",
  KITSCHY_ENCHANTMENT_VENDOR = "20",
  SHOWY_SHIELDS_SHOPKEEPER = "21",
  TALES_TO_TOMES_OWNER = "22",
  ADVENTURERS_GUILD_OWNER = "23",
}

readNpcCsv();
  
export type NPCFactoryManifest = {
  csvData: NpcImport,
  character: Character,
  vendorInventory?: ItemIds[],
  lootInventory?: ItemIds[],
};

export function isMerchant(npc: NPC): boolean {
  return (npc.getSaleItems() !== undefined || npc.getSaleItems().length >= 1);
}

export function npcFactory({csvData, character, vendorInventory, lootInventory}: NPCFactoryManifest): NPC {
  const npc: NPC = {
    private: {
      id: csvData.id,
      name: csvData.name,
      aggro: false, // must be augmented if used
      agility: csvData.agility,
      armor: csvData.armor,
      armorType: [], // must be augmented if used
      attackDescription: csvData.attackDescription,
      cashLoot: csvData.cashLoot,
      characterRef: character,
      combatInterval: null,  // handled in combat
      damageValue: csvData.damageValue,
      deathTime: 0, // handled in combat
      description: csvData.description,
      faction: csvData.faction,
      health: csvData.healthMax,
      healthMax: csvData.healthMax,
      itemLoot: lootInventory || [],
      keywords: csvNpcToKeywords(csvData),
      saleItems: vendorInventory?.map(i => items.get(i)),
      savvy: csvData.savvy,
      sceneId: character.scene_id,
      strength: csvData.strength,
      talkText: csvData.talkText,
      xp: csvData.xp,
    },
    
    getId: undefined,
    getName: undefined,
    getKeywords: undefined,
    getSceneId: undefined,
    
    getAggro: undefined,
    setAggro: undefined,
    
    getAgility: undefined,
    setAgility: undefined,
    
    getArmor: undefined,
    setArmor: undefined,
    
    getArmorType: undefined,
    setArmorType: undefined,
    
    getAttackDescription: undefined,
    setAttackDescription: undefined,
    
    getCashLoot: undefined,
    setCashLoot: undefined,
    
    // characterRef is not gettable or settable, it is purely internal; only a factory should set it initially
    
    getCombatInterval: undefined,
    setCombatInterval: undefined,
    
    getDamageValue: undefined,
    setDamageValue: undefined,
    
    getDeathTime: undefined,
    setDeathTime: undefined,
    
    getDescription: undefined,
    setDescription: undefined,
    
    getFaction: undefined,
    setFaction: undefined,
    
    getHealth: undefined,
    setHealth: undefined,
    
    getHealthMax: undefined,
    setHealthMax: undefined,
    
    getItemLoot: undefined,
    setItemLoot: undefined,
    
    getSaleItems: undefined,
    setSaleItems: undefined,
    
    getSavvy: undefined,
    setSavvy: undefined,
    
    getStrength: undefined,
    setStrength: undefined,
    
    getTalkText: undefined,
    setTalkText: undefined,
    
    getXp: undefined,
    setXp: undefined,
    
    handleNpcCustom: undefined,
    handleNpcLook: undefined,
    handleNpcLookSaleItem: undefined,
    handleNpcGive: undefined,
    handleNpcTalk: undefined,
    handleNpcPurchase: undefined,
    handleNpcSell: undefined,
    handleNpcFight: undefined,
  };
  
  npc.getId = () => npc.private.id;
  npc.getName = () => npc.private.name;
  npc.getKeywords = () => npc.private.keywords;
  npc.getSceneId = () => npc.private.sceneId;
  
  npc.getAggro = () => npc.private.aggro;
  npc.setAggro = (a: boolean) => npc.private.aggro = a;

  npc.getAgility = () => npc.private.agility;
  npc.setAgility = (a: number) => npc.private.agility = a;

  npc.getArmor = () => npc.private.armor;
  npc.setArmor = (a: number) => npc.private.armor = a;
  
  npc.getArmorType = () => npc.private.armorType;
  npc.setArmorType = (a: ArmorType[]) => npc.private.armorType = a;
  
  npc.getAttackDescription = () => npc.private.attackDescription;
  npc.setAttackDescription = (a: string) => npc.private.attackDescription = a;
  
  npc.getCashLoot = () => {
    if (!npc.private.cashLoot) return 0;
    return coinValueRandomizer(npc.private.cashLoot);
  }
  npc.setCashLoot = (c: number) => npc.private.cashLoot = c;
  
  // = is not gettable or settable, it is purely internal; only a factory should set it initially
  
  npc.getCombatInterval = () => npc.private.combatInterval;
  npc.setCombatInterval = (c: NodeJS.Timeout | null) => npc.private.combatInterval = c;
  
  npc.getDamageValue = () => npc.private.damageValue;
  npc.setDamageValue = (d: number) => npc.private.damageValue = d;
  
  npc.getDeathTime = () => npc.private.deathTime;
  npc.setDeathTime = (d: number) => npc.private.deathTime = d;
  
  npc.getDescription = () => {
    const npcHealth: number = npc.getHealth();
    if (npcHealth === undefined || npcHealth > 0) return npc.private.description;
    return `The lifeless body of ${npc.getName()} lies here.`;
  }
  npc.setDescription = (d: string) => npc.private.description = d;
  
  npc.getFaction = () => npc.private.faction;
  npc.setFaction = (f: Faction) => npc.private.faction = f;
  
  npc.getHealth = () => npc.private.health;
  npc.setHealth = (h: number) => npc.private.health = h;
  
  npc.getHealthMax = () => npc.private.healthMax;
  npc.setHealthMax = (h: number) => npc.private.healthMax = h;
  
  npc.getItemLoot = () => npc.private.itemLoot;
  npc.setItemLoot = (i: ItemIds[]) => npc.private.itemLoot = i;
  
  npc.getTalkText = () => npc.private.talkText;
  npc.setTalkText = (t: string) => npc.private.talkText = t;
  
  npc.getSaleItems = () => npc.private.saleItems;
  npc.setSaleItems = (s: Item[]) => npc.private.saleItems = s;
  
  npc.getSavvy = () => npc.private.savvy;
  npc.setSavvy = (s: number) => npc.private.savvy = s;
  
  npc.getStrength = () => npc.private.strength;
  npc.setStrength = (s: number) => npc.private.strength = s;
  
  npc.getXp = () => npc.private.xp;
  npc.setXp = (x: number) => npc.private.xp = x;

  // these empty handlers (most npcs don't use) can be overridden with custom actions in an npc augmentation
  npc.handleNpcCustom = (handlerOptions: HandlerOptions): boolean => {
    return false;
  }
  npc.handleNpcGive = (handlerOptions: HandlerOptions): boolean => {
    return false;
  }

  npc.handleNpcLook = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

    // look at this npc
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_LOOK_ALIASES)) {
      emitOthers(`${character.name} observes ${npc.getName()}.`);
      
      const actorText: string[] = [];
      actorText.push(npc.getDescription());
      emitSelf(actorText);
      
      return true;
    }

    return false;
  }
  
  npc.handleNpcTalk = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

    // talk to this npc
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_TALK_ALIASES)) {
      // don't talk to dead npcs
      if (npc.getHealth() !== undefined && npc.getHealth() <= 0) {
        emitOthers(`${character.name} is talking down to ${npc.getName()}'s corpse.  It is fairly disturbing.`);
        emitSelf(`You talk to ${npc.getName()}'s lifeless body, but it is not very talkative.`);
        return true;
      }

      const actorText: string[] = [npc.getTalkText()];
      
      // In case of mercantile activity
      if (npc.getSaleItems() !== undefined) {
        actorText.push(...npc.getSaleItems()
        .map(item => `- ${item.title} (${item.type}) {${item.getValue()} coin${item.getValue() === 1 ? '' : 's'}}`));
        actorText.push(`You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`);
      }
      
      emitOthers(`${character.name} talks with ${npc.getName()}.`);
      emitSelf(actorText);
      return true;
    }

    return false;
  }

  npc.handleNpcLookSaleItem = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

    if (npc.getSaleItems() === undefined) return false;

    for(let i = 0; i < npc.getSaleItems().length; i++) {
      const currentItem: Item = npc.getSaleItems()[i];
      if (commandMatchesKeywordsFor(command, currentItem.keywords, REGEX_LOOK_ALIASES)) {
        emitOthers(`${name} inspects ${currentItem.title} that ${npc.getName()} has for sale.`);
        emitSelf(currentItem.description);
        return true;
      }
    }

    return false;
  }
  
  npc.handleNpcPurchase = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

    if (npc.getSaleItems() === undefined) return false;

    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch === null) return false;
      
    const item: Item | undefined =
      npc.getSaleItems().find((saleItem: Item) => allTokensMatchKeywords(buyMatch, saleItem.keywords));
    
    if (item !== undefined) {
      if (character.money >= item.getValue()) {
        let characterUpdate: CharacterUpdateOpts = {
          inventory: [ ...character.inventory, item.id ],
          money: character.money - item.getValue()
        };
        if (writeCharacterData(handlerOptions, characterUpdate)) {
          emitOthers(`${character.name} buys ${item.title} from ${npc.getName()} for ${item.getValue()} coins.`);
          emitSelf(`You buy ${item.title} from ${npc.getName()} for ${item.getValue()} coins.`);
          return true;
        }
      } else {
        emitOthers(`${character.name} tries to buy ${item.title} from ${npc.getName()} but can't afford it.`);
        emitSelf(`You cannot afford to buy ${item.title}.`);
        return true;
      }
    }
  
    return false;
  }

  npc.handleNpcSell = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

    if (npc.getSaleItems() === undefined) return false;

    // try sell, specifying which merchant
    const sellItemMatch: string | null = captureSellTo(command, npc);
    if (sellItemMatch !== null) {
      // make sure player has this item
      for (let i = 0; i < character.inventory.length; i++) {
        const item: Item = items.get(character.inventory[i]);
        if (allTokensMatchKeywords(sellItemMatch, item.keywords)) {
          const newInventory: ItemIds[] = [...character.inventory];
          newInventory.splice(i, 1);
          const salePrice: number = Math.ceil(item.getValue() * 0.65);
          if (writeCharacterData(handlerOptions, {
            inventory: newInventory,
            money: character.money + salePrice
          })) {
            emitSelf(`You sold ${item.title} to ${npc.getName()} for ${salePrice} coins.`);
            emitOthers(`${character.name} sold ${item.title} to ${npc.getName()} for ${salePrice} coins.`);
            return true;
          }
        }
      };
    }
    // try sell without specifying which merchant
    const sellMatch: string = captureFrom(command, REGEX_SELL_ALIASES);
    if (sellMatch !== null) {
      // make sure player has this item
      for (let i = 0; i < character.inventory.length; i++) {
        const item: Item = items.get(character.inventory[i]);
        if (allTokensMatchKeywords(sellMatch, item.keywords)) {
          const newInventory: ItemIds[] = [...character.inventory];
          newInventory.splice(i, 1);
          const salePrice: number = Math.ceil(item.getValue() * 0.65);
          if (writeCharacterData(handlerOptions, {
            inventory: newInventory,
            money: character.money + salePrice
          })) {
            emitSelf(`You sold ${item.title} to ${npc.getName()} for ${salePrice} coins.`);
            emitOthers(`${character.name} sold ${item.title} to ${npc.getName()} for ${salePrice} coins.`);
            return true;
          }
        }
      };
    }
  }
  
  npc.handleNpcFight = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

    // fight with this npc
    if ( commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_FIGHT_ALIASES) ) {
      if (npc.getHealth() === undefined) {
        emitOthers(`${character.name} tries to start something with ${npc.getName()}, but ${npc.getName()} is not having it.`);
        emitSelf(`You find that ${npc.getName()} is not willing to engage in a fight with you.`);
        return true;
      }
      if (npc.getHealth() < 1) {
        emitOthers(`${character.name} is beating the corpse of ${npc.getName()}.`);
        emitSelf(`It's easy to hit ${npc.getName()} when they are already dead.`);
        return true;
      }
      if (npc.getCombatInterval() !== null) {
        emitSelf(`Your fight with ${npc.getName()} continues!`);
        return true;
      }
      startCombat(npc, handlerOptions);
      return true;
    }
  
    return false;
  }

  return npc;
}
