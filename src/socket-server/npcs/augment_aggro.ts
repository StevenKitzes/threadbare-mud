import { NPC } from "./npcs";

export function augment_aggro (npc: NPC): NPC {
  npc.setAggro(true);
  return npc;
}