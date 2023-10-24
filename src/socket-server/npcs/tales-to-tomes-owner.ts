import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { csvNpcToKeywords } from "../../utils/csvPropsToKeywords";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { Item, ItemIds } from "../items/items";
import { NpcImport, npcImports } from "./csvNpcImport";
import { ClassTypes } from "../../types";

const id: NpcIds = NpcIds.TALES_TO_TOMES_OWNER;
const csvData: NpcImport = npcImports.get(id);

export function make(): NPC {
  const npc: NPC = {
    id,
    name: csvData.name,
    description: "",
    keywords: csvNpcToKeywords(csvData),


    saleItems: [
      items.get(
      items.get(
      items.get(
      items.get(
      items.get(
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
        `The [owner] looks up with a soft smile from the ledger in which she has been scribbling.  "Ah, it's wonderful to have a customer!"  She extends a hand toward the back of the shop, where even more shelves of books stretch away into dark corners.`,
        character.job === ClassTypes.peacemaker ? '"What sort of title might pique the interest of a wise Peacemaker such as yourself?"' :
          character.job === ClassTypes.skyguard ? '"What kind of material might grasp the attention of a battle-hardened Skyguard such as yourself?"' :
          character.job === ClassTypes.weaver ? '"What types of works might inspire the mind of a traveling Weaver such as yourself?"' :
          '"What might I have that would capture your imagination?"',
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
