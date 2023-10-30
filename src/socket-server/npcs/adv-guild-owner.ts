import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_BUY_ALIASES, REGEX_LOOK_ALIASES, REGEX_TALK_ALIASES } from "../../constants";
import getEmitters from "../../utils/emitHelper";
import { captureFrom, commandMatchesKeywordsFor, makeMatcher } from "../../utils/makeMatcher";
import items, { Item, ItemIds } from "../items/items";
import { HandlerOptions } from "../server";
import { NPC, look, makePurchase } from "./npcs";

export function augment_adv_guild_owner (npc: NPC): NPC {
  // this basic handler can be overridden in an npc augmentation
  npc.handleNpcCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, command, socket } = handlerOptions;
    const { name } = character;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    // look at this npc
    if (look(command, emitOthers, emitSelf, npc, character)) return true;
  
    // talk to this npc
    if (commandMatchesKeywordsFor(command, npc.getKeywords(), REGEX_TALK_ALIASES)) {
      const actorText: string[] = [npc.getTalkText()];
      
      // Mercantile activity
      npc.getSaleItems().forEach(item => {
        // Only show this quest item for sale if the story is in the right state
        if (item.id === ItemIds.TRAVELING_KIT) {
          if (character.stories.main === 2) {
            actorText.push(`- ${item.title} (${item.type}) {${item.getValue()} coins}`);
          }
        } 
        else
          actorText.push(`- ${item.title} (${item.type}) {${item.getValue()} coins}`);
      });
      actorText.push(`You currently have ${character.money} coin${character.money === 1 ? '' : 's'}.`);
      
      emitOthers(`${name} talks with ${npc.getName()}.`);
      emitSelf(actorText);
      return true;
    }

    // look at an item this npc has for sale
    const saleItems: Item[] = npc.getSaleItems();
    for(let i = 0; i < npc.getSaleItems().length; i++) {
      const currentItem: Item = saleItems[i];
      // Don't let player see this quest item if the story isn't in the right state
      if (currentItem.id === ItemIds.TRAVELING_KIT && character.stories.main !== 2) continue;
      if (commandMatchesKeywordsFor(command, currentItem.keywords, REGEX_LOOK_ALIASES)) {
        emitOthers(`${name} inspects ${currentItem.title} that ${npc.getName()} has for sale.`);
        emitSelf(currentItem.description);
        return true;
      }
    }

    // intercept purchase requests for quest item and handle these specifically based on story state
    const kit: Item = items.get(ItemIds.TRAVELING_KIT);
    console.log('try buy kit')
    if (commandMatchesKeywordsFor(command, kit.keywords, REGEX_BUY_ALIASES)) {
      console.log('check story')
      if (character.stories.main === 2) {
        console.log('check money')
        if (character.money >= kit.getValue()) {
          console.log('try write db')
          if (writeCharacterData(character, {
            inventory: [ ...character.inventory, ItemIds.TRAVELING_KIT ],
            money: character.money - kit.getValue(),
            stories: { ...character.stories, main: 3 },
          })) {
            emitOthers(`${name} buys ${kit.title} from ${npc.getName()}.`);
            emitSelf(`You buy ${kit.title} from ${npc.getName()}.`);
            return true;
          }
        } else {
          emitOthers(`${name} tries to buy ${kit.title} but can't afford it.`);
          emitSelf(`You try to buy ${kit.title} but can't afford it.`);
          return true;
        }
      } else {
        console.log('wrong story state to buy travling kit');
      }
      return false;
    } else {
      console.log('no kit buy match with keywords', kit.keywords, 'on command', command)
    }
    
    // purchase from this npc
    if (makePurchase(command, npc, character, emitOthers, emitSelf)) return true;
  
    return false;
  }

  return npc;
}
