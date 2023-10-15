import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { Item, ItemIds } from "../items/items";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.HUMBLE_BLACKSMITH,
    name: "a humble blacksmith",
    description: "A [humble blacksmith] pounds away at his anvil, sweat pouring from his brow the way it only can at the forge.",
    keywords: ['blacksmith', 'humble blacksmith', 'smith', 'humble smith'],
    regexAliases: "blacksmith|smith|humble smith|humble blacksmith",

    saleItems: [
      items.get(ItemIds.STANDARD_BROADSWORD),
      items.get(ItemIds.STANDARD_RAPIER),
      items.get(ItemIds.LITTLE_THROWING_DAGGERS),
      items.get(ItemIds.STANDARD_MACE),
    ],

    getDescription: () => '',

    handleNpcCommand: (handlerOptions: HandlerOptions) => { console.error("handleNpcCommand needs implementation."); return false; },
  }

  npc.getDescription = function (): string {
    return npc.description;
  };

  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (command.match(makeMatcher(REGEX_LOOK_ALIASES, npc.regexAliases))) {
      return look(emitOthers, emitSelf, npc.getDescription, character, npc.name);
    }
  
    // talk to this npc
    if (command.match(makeMatcher(REGEX_TALK_ALIASES, npc.regexAliases))) {
      emitOthers(`${name} talks with ${npc.name}.`);
      emitSelf([
        `Not one for needless chatter, ${npc.name} pauses in his work to look up as you peruse his wares, but says little.  "Interest ye in anything?"`,
        ...npc.saleItems.map(item => `- ${item.title} (${item.type}) {${item.value} coin${item.value === 1 ? '' : 's'}}`),
        `You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`
      ]);
      return true;
    }
  
    // look at an item this npc has for sale
    for(let i = 0; i < npc.saleItems.length; i++) {
      const currentItem: Item = npc.saleItems[i];
      if (command.match(makeMatcher(REGEX_LOOK_ALIASES, currentItem.keywords.join('|')))) {
        emitOthers(`${name} inspects ${currentItem.title} that ${npc.name} has for sale.`);
        emitSelf(currentItem.description);
        return true;
      }
    }
  
    // purchase from this npc
    const buyMatch: string | null = captureFrom(command, REGEX_BUY_ALIASES);
    if (buyMatch !== null) {
      if (makePurchase(buyMatch, npc.saleItems, character, emitOthers, emitSelf, npc.name)) return true;
    }
  
    return false;
  }

  return npc;
}
