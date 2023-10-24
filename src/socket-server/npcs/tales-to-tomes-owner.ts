import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NPC, look, makePurchase } from "./npcs";
import { commandMatchesKeywordsFor } from "../../utils/makeMatcher";
import { REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import { Item } from "../items/items";
import { ClassTypes } from "../../types";

export function augment_talesToTomesOwner(npc: NPC): NPC {
  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (look(command, emitOthers, emitSelf, npc, character)) return true;
  
    // talk to this npc
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_TALK_ALIASES)) {
      emitOthers(`${name} talks with ${npc.getName()}.`);
      emitSelf([
        `The [owner] looks up with a soft smile from the ledger in which she has been scribbling.  "Ah, it's wonderful to have a customer!"  She extends a hand toward the back of the shop, where even more shelves of books stretch away into dark corners.`,
        character.job === ClassTypes.peacemaker ? '"What sort of title might pique the interest of a wise Peacemaker such as yourself?"' :
          character.job === ClassTypes.skyguard ? '"What kind of material might grasp the attention of a battle-hardened Skyguard such as yourself?"' :
          character.job === ClassTypes.weaver ? '"What types of works might inspire the mind of a traveling Weaver such as yourself?"' :
          '"What might I have that would capture your imagination?"',
        ...npc.getSaleItems().map(item => `- ${item.title} (${item.type}) {${item.value} coin${item.value === 1 ? '' : 's'}}`),
        `You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`
      ]);
      return true;
    }
  
    // look at an item this npc has for sale
    if (npc.getSaleItems() !== undefined) {
      for(let i = 0; i < npc.getSaleItems().length; i++) {
        const currentItem: Item = npc.getSaleItems()[i];
        if (commandMatchesKeywordsFor(command, currentItem.keywords, REGEX_LOOK_ALIASES)) {
          emitOthers(`${name} inspects ${currentItem.title} that ${npc.getName()} has for sale.`);
          emitSelf(currentItem.description);
          return true;
        }
      }
    }
  
    // purchase from this npc
    if (makePurchase(command, npc, character, emitOthers, emitSelf)) return true;
  
    return false;
  }

  return npc;
}
