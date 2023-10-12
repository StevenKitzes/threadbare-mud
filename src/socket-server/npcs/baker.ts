import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC } from "./npcs";
import { npcHealthText } from '../../utils/npcHealthText';
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_FIGHT_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { firstCharToUpper } from "../../utils/firstCharToUpper";
import { writeCharacterData } from "../../../sqlite/sqlite";
import items, { Item, ItemIds } from "../items/items";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.BAKER,
    name: "a baker",
    description: "A [baker] displays her goods, with a smile as warm as her freshly baked breads, sweetrolls, and cakes.",
    keywords: ['baker'],
    regexAliases: 'baker',
    attackDescription: 'loaf toss',

    saleItems: [items.get(ItemIds.SWEETROLL), items.get(ItemIds.BREAD_LOAF), items.get(ItemIds.CAKE)],

    getDescription: () => '',

    handleNpcCommand: (handlerOptions: HandlerOptions) => { console.error("handleNpcCommand needs implementation."); return false; },
  }

  npc.setHealth = function (h: number): void { npc.health = h; };
  npc.setDeathTime = function (d: number): void { npc.deathTime = d; };
  npc.setCombatInterval = function (c: NodeJS.Timeout | null): void { npc.combatInterval = c; };

  npc.getDescription = function (): string {
    return npc.description;
  };

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name, scene_id: sceneId } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (command.match(makeMatcher(REGEX_LOOK_ALIASES, npc.regexAliases))) {
      emitOthers(`${name} is checking out ${npc.name}'s goods.`);
  
      const actorText: string[] = [];
      if (npc.health > 0) actorText.push(npc.getDescription(character));
      actorText.push(npcHealthText(npc.name, npc.health, npc.healthMax));
      emitSelf(actorText);
      
      return true;
    }
  
    // talk to this npc
    if (command.match(makeMatcher(REGEX_TALK_ALIASES, npc.regexAliases))) {
      emitOthers(`${name} talks with ${npc.name}.`);
      emitSelf([
        `${firstCharToUpper(npc.name)} beams at you, eager to share the labor of her work.  "Good day, friend!  Can I interest you in some tasty treats?  I have much to offer!  Here is what I have for sale."`,
        ...npc.saleItems.map(item => `- ${item.title} (${item.type}) ${item.value} coins`),
        `You currently have ${character.money} coins.`
      ]);
      return true;
    }
  
    // purchase from this npc
    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch !== null) {
      const item: Item | undefined =
        npc.saleItems.find((saleItem: Item) => buyMatch.match(makeMatcher(saleItem.keywords.join('|'))));

      if (item !== undefined) {
        if (character.money >= item.value) {
          const newInventory: string[] = [ ...character.inventory, item.id ];
          if (writeCharacterData(character.id, {
            money: character.money - item.value,
            inventory: newInventory
          })) {
            character.money -= item.value;
            character.inventory.push(item.id);
            emitOthers(`${name} buys ${item.title} from ${npc.name}, it looks delicious.`);
            emitSelf(`You buy ${item.title} from ${npc.name}.`);
          }
        } else {
          emitOthers(`${name} tries to buy ${item.title} from ${npc.name} but can't afford it.`);
          emitSelf(`You cannot afford to buy ${item.title}.`);
          return true;
        }
      }
    }
  
    return false;
  }

  return npc;
}
