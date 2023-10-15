import { REGEX_HORSE_ALIASES, REGEX_LOOK_ALIASES, REGEX_RENAME_ALIASES } from "../../constants";
import { captureFrom, captureFrom_fromHorse, captureFrom_toHorse, makeMatcher } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { getEmitters } from '../../utils/emitHelper';
import { scenes } from "../scenes/scenes";
import { Character, Horse } from "../../types";
import { OptsType } from "../../utils/getGameTextObject";
import items, { Item, ItemIds } from "../items/items";
import { writeCharacterData } from "../../../sqlite/sqlite";
import { getEncumbranceString } from "../../utils/encumbrance";
import { firstCharToUpper } from "../../utils/firstCharToUpper";

// capacity mapping
export const saddlebagCapacityMap: Map<ItemIds, number> = new Map<ItemIds, number>();
saddlebagCapacityMap.set(ItemIds.MODEST_SADDLEBAGS, 40);
saddlebagCapacityMap.set(ItemIds.LEATHER_SADDLEBAGS, 80);

function getHorseEncumbranceString ({ name, saddlebagsId, inventory }: Horse): string {
  const carried: number = inventory.reduce((acc, cur) => acc + items.get(cur).weight, 0);
  const maxCarry: number = saddlebagCapacityMap.get(saddlebagsId);

  if ( carried < maxCarry * 0.25 ) return `${name} is hardly carrying anything in their saddlebags.`;
  else if ( carried < maxCarry * 0.5 ) return `${name} is carrying a comfortable amount in their saddlebags.`;
  else if ( carried < maxCarry * 0.75 ) return `${name}'s saddlebags are loaded with a heavy amount of cargo.`;
  else if ( carried < maxCarry * 0.9 ) return `${name}'s saddlebags sag with the weight of all you've put there.`;
  else return `${name}'s saddlebags are nearly full.`
}

function horseAllowed (
  character: Character,
  emitOthers: (text: string | string[], opts?: OptsType) => void,
  emitSelf: (text: string | string[], opts?: OptsType) => void
): boolean {
  if (!scenes.get(character.scene_id).horseAllowed) {
    emitOthers(`${character.name} is looking for something, or someone, that they can't find.`);
    emitSelf(`${character.horse.name} is not here.  (They could not follow you inside.  Head outside to find them.)`);
    return false;
  }
  return true;
}

export function handleHorseCommand (handlerOptions: HandlerOptions): boolean {
  const { character, command, socket } = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  if (character.horse === null) return false;

  if (!horseAllowed(character, emitOthers, emitSelf)) return true;

  if (command.match(makeMatcher(REGEX_LOOK_ALIASES, `${REGEX_HORSE_ALIASES}|${character.horse.name.toLowerCase()}`))) {
    emitOthers(`${character.name} rifles through their horse's saddlebags.`);

    const saddlebagsTitle: string = items.get(character.horse.saddlebagsId).title;
    const actorText: string[] = [];
    actorText.push(`You see ${character.horse.name}, wearing ${saddlebagsTitle}.`);
    character.horse.inventory.map(i => actorText.push(`In ${saddlebagsTitle} you find ${items.get(i).title}.`));
    actorText.push(getHorseEncumbranceString(character.horse));
    actorText.push(`You can [give {item} to horse], [get {item} from horse], [rename horse {new-name}].`);
    emitSelf(actorText);

    return true;
  }

  const renameMatch: string = captureFrom(command, `${REGEX_RENAME_ALIASES}) (?:${REGEX_HORSE_ALIASES}`);
  if (renameMatch !== null) {
    const formattedRenameMatch: string = firstCharToUpper(renameMatch.trim());
    if (formattedRenameMatch.length < 3) {
      emitSelf(`That name is too short.  Your horse deserves a longer name (3 characters at least)!`);
      return true;
    } else if (formattedRenameMatch.length > 20) {
      emitSelf(`That name is too long.  Your horse won't be able to remember it (20 characters at most)!`);
      return true;
    } else {
      if (writeCharacterData(character.id, {
        horse: {
          ...character.horse,
          name: formattedRenameMatch
        }
      })) {
        character.horse.name = formattedRenameMatch;
        emitSelf(`Your horse will now answer to the name {${formattedRenameMatch}}.`);
        return true;
      }
    }
  }

  const giveMatch: string = captureFrom_toHorse(command, character.horse.name.toLowerCase());
  if (giveMatch !== null) {
    // make sure player has this item

    for (let i = 0; i < character.inventory.length; i++) {
      const item: Item = items.get(character.inventory[i]);
      if (item.keywords.includes(giveMatch)) {
        // make sure horse can carry this
        const maxCarry: number = saddlebagCapacityMap.get(character.horse.saddlebagsId);
        const carried: number = character.horse.inventory.reduce((acc, cur) => acc + items.get(cur).weight, 0);
        if (carried + item.weight > maxCarry) {
          emitOthers(`${character.name} tried to move ${item.title} to their horse's saddlebags, but it wouldn't fit.`);
          emitSelf(`You try to put ${item.title} away in ${character.horse.name}'s saddlebags, but it doesn't fit.`);
          return true;
        }

        const newInventory: ItemIds[] = [...character.inventory];
        const newHorseInventory: ItemIds[] = [...character.horse.inventory];
        newHorseInventory.push(newInventory.splice(i, 1)[0]);
        if (writeCharacterData(character.id, {
          inventory: newInventory,
          horse: {
            ...character.horse,
            inventory: newHorseInventory
          }
        })) {
          character.inventory = newInventory;
          character.horse.inventory = newHorseInventory;
          emitSelf([
            `You put ${item.title} away in ${items.get(character.horse.saddlebagsId).title}.`,
            getHorseEncumbranceString(character.horse),
            getEncumbranceString(character),
          ]);
          emitOthers(`${character.name} put ${item.title} in ${items.get(character.horse.saddlebagsId).title}.`);
          return true;
        }
      }
    };
    emitSelf(`You do not have any [${giveMatch}] to give to ${character.horse.name}.`);
    return true;
  }

  const getMatch: string = captureFrom_fromHorse(command, character.horse.name.toLowerCase());
  if (getMatch !== null) {
    for (let i = 0; i < character.horse.inventory.length; i++) {
      const item: Item = items.get(character.horse.inventory[i]);
      if (item.keywords.includes(getMatch)) {
        const newInventory: ItemIds[] = [...character.inventory];
        const newHorseInventory: ItemIds[] = [...character.horse.inventory];
        newInventory.push(newHorseInventory.splice(i, 1)[0]);
        if (writeCharacterData(character.id, {
          inventory: newInventory,
          horse: {
            ...character.horse,
            inventory: newHorseInventory
          }
        })) {
          console.log('wrote character data')
          character.inventory = newInventory;
          character.horse.inventory = newHorseInventory;
          emitSelf([
            `You grabbed ${item.title} out of ${items.get(character.horse.saddlebagsId).title}.`,
            getHorseEncumbranceString(character.horse),
            getEncumbranceString(character),
          ]);
          emitOthers(`${character.name} grabbed ${item.title} from ${items.get(character.horse.saddlebagsId).title}.`);
          return true;
        }
      }
    };
    emitSelf(`There is no [${getMatch}] in ${items.get(character.horse.saddlebagsId).title}.`);
    return true;
  }

  return false;
}
