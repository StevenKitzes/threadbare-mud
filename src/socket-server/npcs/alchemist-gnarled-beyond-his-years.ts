import getEmitters from "../../utils/emitHelper";
import { HandlerOptions } from "../server";
import { NpcIds, NPC, look, makePurchase } from "./npcs";
import { captureFrom, makeMatcher } from "../../utils/makeMatcher";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import items, { Item, ItemIds } from "../items/items";
import { NpcImport, npcImports } from "./csvNpcImport";

const id: NpcIds = NpcIds.ALCHEMIST_GNARLED_BEYOND_HIS_YEARS;
const csvData: NpcImport = npcImports.get(id);

export function make(): NPC {
  const npc: NPC = {
    id,
    name: csvData.name,
    description: "A [young alchemist] whose body is nevertheless twisted and gnarled, whether by failed potions or experimental recipes.  He wears dark rags, now tattered and stained, but once fine.",
    keywords: ['young alchemist', 'gnarled alchemist', 'twisted alchemist', 'alchemist'],
    regexAliases: 'alchemist|young alchemist|gnarled alchemist|twisted alchemist',

    saleItems: [
      items.get(ItemIds.SMALL_HEALING_POTION),
      items.get(ItemIds.STRENGTH_POTION),
      items.get(ItemIds.RANGED_ATTACK_POTION),
      items.get(ItemIds.HEAVY_ATTACK_POTION),
      items.get(ItemIds.AGILITY_POTION),
      items.get(ItemIds.SAVVY_POTION),
      items.get(ItemIds.LIGHT_ATTACK_POTION),
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
        `You find ${npc.name}, who looks to have seen too few years for his body to be as worn as it is.  His demeanor is earnest, his eyes sharp, though they point in two completely different directions.  "Ah, you've come for potions, have you?  Well, then, just the thing.  Just the thing!  Look here..."`,
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
