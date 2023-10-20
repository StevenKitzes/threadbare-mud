import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { Item, ItemIds } from "../items/items";
import { NpcImport, npcImports } from "./csvNpcImport";

const id: NpcIds = NpcIds.PARLIAMENTARY_DECORATIVE_SMITH;
const csvData: NpcImport = npcImports.get(id);

export function make(): NPC {
  const npc: NPC = {
    id,
    name: csvData.name,
    description: "A [master armorer], working with a set of the best tools money can buy.  He crafts armor that will do its job in the field, but looks good enough to illustrate the station of his noble-born clientele.",
    keywords: ['armorer', 'master armorer', 'master'],
    regexAliases: 'armorer|master|master armorer',

    saleItems: [
      items.get(ItemIds.PARLIAMENT_GREAT_HELM),
      items.get(ItemIds.PARLIAMENT_ARMOR),
      items.get(ItemIds.PARLIAMENT_GAUNTLETS),
      items.get(ItemIds.PARLIAMENT_GREAVES),
      items.get(ItemIds.PARLIAMENT_BOOTS),
      items.get(ItemIds.PARLIAMENT_DECORATIVE_SWORD),
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
        `This [master armorer] has shifted his career from building war gear, to crafting decorative dress pieces for the nobility of Parliament.  He is so absorbed in his work etching and embossing that he hardly notices your approach.  "Ahh, apologies, I didn't see you there.  Can I help you?  I have a few offerings you might be interested in."`,
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
