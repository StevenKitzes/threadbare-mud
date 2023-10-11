import items from "../items/items";
import { HandlerOptions } from "../server";

export type NPC = {
  id: string;
  name: string;
  description: string;
  keywords: string[];

  cashLoot: number;
  itemLoot: string[];
  healthMax: number;
  agility: number;
  strength: number;
  savvy: number;
  damageValue: number;
  armor: number;
  armorType: ArmorType[];
  
  health: number;
  deathTime: number;
  combatInterval: NodeJS.Timeout | null;

  setHealth: (amount: number) => void;
  setDeathTime: (d: number) => void;
  setCombatInterval: (c: NodeJS.Timeout | null) => void;

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
  SMALL_RAT = "2"
}

// import('./audric').then(npc => npcs.set(npc.id, npc));
import('./small-rat').then(npc => npcFactories.set(NpcIds.SMALL_RAT, npc.make));

export default items;
