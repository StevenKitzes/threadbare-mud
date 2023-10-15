import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { Item, ItemIds } from "../items/items";

export function make(): NPC {
  const npc: NPC = {
    id: NpcIds.LEATHER_WORKER,
    name: "a leather worker",
    description: "A [leather worker], plying his trade in the shade of a broad strip of canvas and surrounded by the fruits of his labor: an array of leather armors suitable for light combat action.",
    keywords: ['leather worker', 'tanner', 'armorer'],
    regexAliases: 'leather worker|tanner|armorer',

    saleItems: [
      items.get(ItemIds.LIGHT_LEATHER_CAP),
      items.get(ItemIds.PADDED_LEATHER_ARMOR),
      items.get(ItemIds.STURDY_LEATHER_GLOVES),
      items.get(ItemIds.SPLINTED_LEATHER_LEGGINGS),
      items.get(ItemIds.HEAVY_LEATHER_BOOTS),
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
        `This leather worker looks exhausted from his work, and a bit corroded from constant exposure to the sun.  He is nevertheless pleased to see a customer showing interest in his stock.  "Greetings, greetings!  Please, have a look!  I'm sure I've something ye'd find useful."`,
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
