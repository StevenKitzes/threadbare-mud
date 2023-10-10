import items from "../socket-server/items/items";
import { Character } from "../types";

export function characterCanMove (character: Character): boolean {
  let carried: number =
    character.inventory.reduce( (runningTotal, itemId) => runningTotal + (items.get(itemId)?.weight || 0), 0 );
  if (character.headgear) carried += items.get(character.headgear)?.weight || 0;
  if (character.armor) carried += items.get(character.armor)?.weight || 0;
  if (character.gloves) carried += items.get(character.gloves)?.weight || 0;
  if (character.legwear) carried += items.get(character.legwear)?.weight || 0;
  if (character.footwear) carried += items.get(character.footwear)?.weight || 0;
  if (character.weapon) carried += items.get(character.weapon)?.weight || 0;
  if (character.offhand) carried += items.get(character.offhand)?.weight || 0;
  const maxCarry: number = character.strength * 10;

  if (carried > maxCarry) return false;

  return true;
}

export default characterCanMove;
