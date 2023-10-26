import { captureFrom, commandMatchesKeywordsFor, makeMatcher } from "../../utils/makeMatcher";
import { Character, CharacterUpdateOpts, Faction } from "../../types";
import { OptsType } from "../../utils/getGameTextObject";
import items, { Item, ItemIds } from "../items/items";
import { HandlerOptions } from "../server";
import { csvNpcToKeywords } from "../../utils/csvPropsToKeywords";
import { writeCharacterData } from "../../../sqlite/sqlite";
import { NpcImport, readNpcCsv } from "./csvNpcImport";
import { REGEX_BUY_ALIASES, REGEX_FIGHT_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import startCombat from "../../utils/combat";
import { coinValueRandomizer } from "../../utils/coinValueRandomizer";

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
    talkText: string;
    saleItems: Item[];
    savvy: number;
    strength: number;
    xp: number;
  };

  // these are not settable
  getId: () => NpcIds;
  getName: () => string;
  getKeywords: () => string[];
  
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

  getTalkText: () => string;
  setTalkText: (t: string) => void;

  getSaleItems: () => Item[];
  setSaleItems: (s: Item[]) => void;

  getSavvy: () => number;
  setSavvy: (s: number) => void;

  getStrength: () => number;
  setStrength: (s: number) => void;

  getXp: () => number;
  setXp: (x: number) => void;

  handleNpcCommand: (handlerOptions: HandlerOptions) => boolean;
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
}

readNpcCsv();
  
export function look(
  command: string,
  emitOthers: (text: string | string[], opts?: OptsType) => void,
  emitSelf: (text: string | string[], opts?: OptsType) => void,
  npc: NPC,
  character: Character,
): true {
  if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_LOOK_ALIASES)) {
    emitOthers(`${character.name} observes ${npc.getName()}.`);
    
    const actorText: string[] = [];
    actorText.push(npc.getDescription());
    emitSelf(actorText);
    
    return true;
  }
}

export function makePurchase(
  command: string,
  npc: NPC,
  character: Character,
  emitOthers: (text: string | string[], opts?: OptsType) => void,
  emitSelf: (text: string | string[], opts?: OptsType) => void,
): boolean {
  const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
  if (buyMatch !== null) {
    
    const item: Item | undefined =
      npc.getSaleItems().find((saleItem: Item) => buyMatch.match(makeMatcher(saleItem.keywords.join('|'))));
    
    if (item !== undefined) {
      if (character.money >= item.getValue()) {
        let characterUpdate: CharacterUpdateOpts = {
          inventory: [ ...character.inventory, item.id ],
          money: character.money - item.getValue()
        };
        if (writeCharacterData(character, characterUpdate)) {
          emitOthers(`${character.name} buys ${item.title} from ${npc.getName()}.`);
          emitSelf(`You buy ${item.title} from ${npc.getName()}.`);
          return true;
        }
      } else {
        emitOthers(`${character.name} tries to buy ${item.title} from ${npc.getName()} but can't afford it.`);
        emitSelf(`You cannot afford to buy ${item.title}.`);
        return true;
      }
    }
  }

  return false;
}

export type NPCFactoryManifest = {
  csvData: NpcImport,
  character: Character,
  vendorInventory?: ItemIds[],
  lootInventory?: ItemIds[],
};

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
      talkText: csvData.talkText,
      saleItems: vendorInventory?.map(i => items.get(i)),
      savvy: csvData.savvy,
      strength: csvData.strength,
      xp: csvData.xp,
    },

    getId: undefined,
    getName: undefined,
    getKeywords: undefined,
    
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
  
    getTalkText: undefined,
    setTalkText: undefined,
  
    getSaleItems: undefined,
    setSaleItems: undefined,
  
    getSavvy: undefined,
    setSavvy: undefined,
  
    getStrength: undefined,
    setStrength: undefined,
  
    getXp: undefined,
    setXp: undefined,
  
    handleNpcCommand: undefined,
  };

  npc.getId = () => npc.private.id;
  npc.getName = () => npc.private.name;
  npc.getKeywords = () => npc.private.keywords;
  
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

  // this basic handler can be overridden in an npc augmentation
  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (look(command, emitOthers, emitSelf, npc, character)) return true;
  
    // talk to this npc
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_TALK_ALIASES)) {
      const actorText: string[] = [npc.getTalkText()];
      
      // In case of mercantile activity
      if (npc.getSaleItems() !== undefined) {
        actorText.push(...npc.getSaleItems()
        .map(item => `- ${item.title} (${item.type}) {${item.getValue()} coin${item.getValue() === 1 ? '' : 's'}}`));
        actorText.push(`You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`);
      }
      
      emitOthers(`${name} talks with ${npc.getName()}.`);
      emitSelf(actorText);
      return true;
    }

    // look at an item this npc has for sale
    if (npc.getSaleItems() !== undefined) {
      for(let i = 0; i < npc.getSaleItems().length; i++) {
        const currentItem: Item = npc.getSaleItems()[i];
        if (commandMatchesKeywordsFor(command, currentItem.keywords, REGEX_LOOK_ALIASES)) {
          emitOthers(`${name} inspects ${currentItem.title} that ${npc.getName()} has for sale.`);
          emitSelf(currentItem.description);
          return true;
        }
      }
    }
  
    // purchase from this npc
    if (makePurchase(command, npc, character, emitOthers, emitSelf)) return true;

    // fight with this npc
    if (
      npc.getHealth() !== undefined &&
      commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_FIGHT_ALIASES)
    ) {
      if (npc.getHealth() < 1) {
        emitOthers(`${character.name} is beating the corpse of ${npc.getName()}.`);
        emitSelf(`It's easy to hit ${npc.getName()} when they are already dead.`);
        return true;
      }
      if (npc.getCombatInterval() !== null) {
        emitSelf(`You are already fighting ${npc.getName()}!`);
        return true;
      }
      startCombat(npc, handlerOptions);
      return true;
    }
  
    return false;
  }

  return npc;
}
