import items from "../socket-server/items/items";
import { Character } from "../types";

export function getCarriedWeight (character: Character): number {
  let carried: number =
    character.inventory.reduce( (runningTotal, itemId) => runningTotal + (items.get(itemId)?.weight || 0), 0 );
  carried += items.get(character.headgear || '')?.weight || 0;
  carried += items.get(character.armor || '')?.weight || 0;
  carried += items.get(character.gloves || '')?.weight || 0;
  carried += items.get(character.legwear || '')?.weight || 0;
  carried += items.get(character.footwear || '')?.weight || 0;
  carried += items.get(character.weapon || '')?.weight || 0;
  carried += items.get(character.offhand || '')?.weight || 0;
  return carried;
}

export function getMaxCarry (character: Character): number {
  return character.strength * 10;
}

export function characterCanMove (character: Character): boolean {
  const carried: number = getCarriedWeight(character);
  const maxCarry: number = getMaxCarry(character);

  if (carried > maxCarry) return false;

  return true;
}

export function getEncumbranceString (character: Character): string {
  const carried: number = getCarriedWeight(character);
  const maxCarry: number = getMaxCarry(character);
  if (carried < maxCarry * 0.25) {
    return "You barely notice the weight of the things you are carrying.";
  } else if (carried < maxCarry * 0.5) {
    return "You are carrying enough that you notice the weight.";
  } else if (carried < maxCarry * 0.75) {
    return "You sweat a little under the load of all you're carrying.";
  } else if (carried <= maxCarry) {
    return "You can barely carry all the things you've accumulated.";
  } else {
    return "You are carrying so much that you can't take another step.";
  }
}

export default characterCanMove;
