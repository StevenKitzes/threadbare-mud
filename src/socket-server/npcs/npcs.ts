import { makeMatcher } from "../../utils/makeMatcher";
import { Character, CharacterUpdateOpts, Faction } from "../../types";
import { OptsType } from "../../utils/getGameTextObject";
import { Item, ItemIds } from "../items/items";
import { HandlerOptions } from "../server";
import { writeCharacterData } from "../../../sqlite/sqlite";
import { readNpcCsv } from "./csvNpcImport";

export type NPC = {
  id: NpcIds;
  name: string;
  description: string;
  keywords: string[];
  regexAliases: string;
  
  faction?: Faction;
  attackDescription?: string;
  cashLoot?: number;
  itemLoot?: ItemIds[];
  saleItems?: Item[];
  xp?: number;
  healthMax?: number;
  agility?: number;
  strength?: number;
  savvy?: number;
  damageValue?: number;
  armor?: number;
  armorType?: ArmorType[];
  aggro?: boolean;
  
  health?: number;
  deathTime?: number;
  combatInterval?: NodeJS.Timeout | null;

  setHealth?: (amount: number) => void;
  setDeathTime?: (d: number) => void;
  setCombatInterval?: (c: NodeJS.Timeout | null) => void;

  getDescription: (character: Character) => string;

  handleNpcCommand: (handlerOptions: HandlerOptions) => boolean;
};

export const npcFactories: Map<string, () => NPC> = new Map<string, () => NPC>();

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
}

readNpcCsv(() => {
  import('./audric').then(npc => npcFactories.set(NpcIds.AUDRIC, npc.make));
  import('./small-rat').then(npc => npcFactories.set(NpcIds.SMALL_RAT, npc.make));
  import('./stout-rat').then(npc => npcFactories.set(NpcIds.STOUT_RAT, npc.make));
  import('./rabid-rat').then(npc => npcFactories.set(NpcIds.RABID_RAT, npc.make));
  import('./baker').then(npc => npcFactories.set(NpcIds.BAKER, npc.make));
  import('./fruit-vendor').then(npc => npcFactories.set(NpcIds.FRUIT_VENDOR, npc.make));
  import('./luxury-clothier').then(npc => npcFactories.set(NpcIds.LUXURY_CLOTHIER, npc.make));
  import('./stablemaster').then(npc => npcFactories.set(NpcIds.STABLEMASTER, npc.make));
  import('./humble-blacksmith').then(npc => npcFactories.set(NpcIds.HUMBLE_BLACKSMITH, npc.make));
  import('./leather-worker').then(npc => npcFactories.set(NpcIds.LEATHER_WORKER, npc.make));
  import('./alchemist-gnarled-beyond-his-years').then(npc => npcFactories.set(NpcIds.ALCHEMIST_GNARLED_BEYOND_HIS_YEARS, npc.make));
  import('./civilized-silversmith').then(npc => npcFactories.set(NpcIds.CIVILIZED_SILVERSMITH, npc.make));
  import('./parliamentary-decorative-smith').then(npc => npcFactories.set(NpcIds.PARLIAMENTARY_DECORATIVE_SMITH, npc.make));
  import('./gruff-innkeeper').then(npc => npcFactories.set(NpcIds.GRUFF_INNKEEPER, npc.make));
  import('./sneering-peacekeeper').then(npc => npcFactories.set(NpcIds.SNEERING_PEACEKEEPER, npc.make));
  import('./scowling-peacekeeper').then(npc => npcFactories.set(NpcIds.SCOWLING_PEACEKEEPER, npc.make));
  import('./glowering-peacekeeper').then(npc => npcFactories.set(NpcIds.GLOWERING_PEACEKEEPER, npc.make));
  import('./peacekeeper-captain').then(npc => npcFactories.set(NpcIds.PEACEKEEPER_CAPTAIN, npc.make));
  import('./hunting-bowyer').then(npc => npcFactories.set(NpcIds.HUNTING_BOWYER, npc.make));
  import('./kitschy-enchantment-vendor').then(npc => npcFactories.set(NpcIds.KITSCHY_ENCHANTMENT_VENDOR, npc.make));
  import('./showy-shields-shopkeeper').then(npc => npcFactories.set(NpcIds.SHOWY_SHIELDS_SHOPKEEPER, npc.make));
});
  
  export function look(
    emitOthers: (text: string | string[], opts?: OptsType) => void,
  emitSelf: (text: string | string[], opts?: OptsType) => void,
  getDescription: (character: Character) => string,
  character: Character,
  npcName: string,
): true {
  emitOthers(`${character.name} observes ${npcName}.`);

  const actorText: string[] = [];
  actorText.push(getDescription(character));
  emitSelf(actorText);
  
  return true;
}

export function makePurchase(
  buyMatch: string,
  saleItems: Item[],
  character: Character,
  emitOthers: (text: string | string[], opts?: OptsType) => void,
  emitSelf: (text: string | string[], opts?: OptsType) => void,
  npcName: string,
): boolean {
  const item: Item | undefined =
    saleItems.find((saleItem: Item) => buyMatch.match(makeMatcher(saleItem.keywords.join('|'))));

  if (item !== undefined) {
    if (character.money >= item.value) {
      let characterUpdate: CharacterUpdateOpts = {
        inventory: [ ...character.inventory, item.id ],
        money: character.money - item.value
      };
      if (writeCharacterData(character.id, characterUpdate)) {
        Object.keys(characterUpdate).forEach(key => character[key] = characterUpdate[key]);
        emitOthers(`${character.name} buys ${item.title} from ${npcName}.`);
        emitSelf(`You buy ${item.title} from ${npcName}.`);
        return true;
      }
    } else {
      emitOthers(`${character.name} tries to buy ${item.title} from ${npcName} but can't afford it.`);
      emitSelf(`You cannot afford to buy ${item.title}.`);
      return true;
    }
  }

  return false;
}
