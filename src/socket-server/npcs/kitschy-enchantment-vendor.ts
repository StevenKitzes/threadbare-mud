import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { Item, ItemIds } from "../items/items";
import { NpcImport, npcImports } from "./csvNpcImport";

const id: NpcIds = NpcIds.KITSCHY_ENCHANTMENT_VENDOR;
const csvData: NpcImport = npcImports.get(id);

export function make(): NPC {
  const npc: NPC = {
    id,
    name: csvData.name,
    description: "A kitschy [enchantment vendor] has a broad array of items on display, that he swears are magical.",
    keywords: ['vendor', 'enchantment vendor', 'kitschy enchantment vendor'],
    regexAliases: 'vendor|enchantment vendor|kitschy enchantment vendor',

    saleItems: [
      items.get(ItemIds.FLICKWRIST_BRACERS),
      items.get(ItemIds.STOUT_STANCE_BOOTS),
      items.get(ItemIds.EAGLE_EYE_SPECTACLES),
      items.get(ItemIds.QUICKSTEP_TROUSERS),
      items.get(ItemIds.STRONGSLEEVES_COAT),
      items.get(ItemIds.THINKING_CAP),
      items.get(ItemIds.FOESBANE_GLOVES),
      items.get(ItemIds.TRUESTRIKE_GLOVES),
      items.get(ItemIds.PROTECTION_CHARM),
      items.get(ItemIds.DEFTSTEP_BOOTS),
      items.get(ItemIds.SCALESKIN_JACKET),
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
        `This [enchantment vendor] has an array of goods for sale that is suspiciously kitschy.  Nothing on the table looks to be of quite high enough quality to justify enchantment.  Nevertheless, there is something odd about him that makes you want to trust him.  "Greetings, my friend!  A little magical spring in your step, today?"  He beams at you and gestures towards his cart.`,
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
