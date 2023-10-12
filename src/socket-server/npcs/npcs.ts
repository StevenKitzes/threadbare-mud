import { Character } from "../../types";
import items from "../items/items";
import { HandlerOptions } from "../server";

export type NPC = {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  regexAliases: string;
  attackDescription: string;

  cashLoot: number;
  itemLoot: string[];
  xp: number;
  healthMax: number;
  agility: number;
  strength: number;
  savvy: number;
  damageValue: number;
  armor: number;
  armorType: ArmorType[];
  aggro: boolean;
  
  health: number;
  deathTime: number;
  combatInterval: NodeJS.Timeout | null;

  setHealth: (amount: number) => void;
  setDeathTime: (d: number) => void;
  setCombatInterval: (c: NodeJS.Timeout | null) => void;

  getDescription: (character: Character) => string;

  handleNpcCommand: (handlerOptions: HandlerOptions) => boolean;
};

export const npcFactories: Map<string, () => NPC> = new Map<string, () => NPC>();

export enum ArmorType {
  strongVsSlashing,
  strongVsPiercing,
  strongVsBashing,
  weakVsSlashing,
  weakVsPiercing,
  weakVsBashing
};

export enum NpcIds {
  AUDRIC = "1",
  SMALL_RAT = "2",
  STOUT_RAT = "3",
  RABID_RAT = "4",
  BAKER = "5",
  FRUIT_VENDOR = "6",
}

import('./audric').then(npc => npcFactories.set(NpcIds.AUDRIC, npc.make));
import('./small-rat').then(npc => npcFactories.set(NpcIds.SMALL_RAT, npc.make));
import('./stout-rat').then(npc => npcFactories.set(NpcIds.STOUT_RAT, npc.make));
import('./rabid-rat').then(npc => npcFactories.set(NpcIds.RABID_RAT, npc.make));
import('./baker').then(npc => npcFactories.set(NpcIds.BAKER, npc.make));
import('./fruit-vendor').then(npc => npcFactories.set(NpcIds.FRUIT_VENDOR, npc.make));

export default items;
