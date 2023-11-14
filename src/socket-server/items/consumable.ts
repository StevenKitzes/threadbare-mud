import { writeCharacterData } from "../../../sqlite/sqlite";
import { REGEX_DRINK_ALIASES } from "../../constants";
import { CharacterUpdateOpts, TemporaryEffect } from "../../types";
import getEmitters from "../../utils/emitHelper";
import { commandMatchesKeywordsFor } from "../../utils/makeMatcher";
import { HandlerOptions } from "../server";
import { Item, consumeItem } from "./items";

export function augment_consumable (item: Item, actionAliases: string, consumeEffects?: TemporaryEffect[]): Item {
  item.handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
    if (consumeItem({
      item,
      handlerOptions,
      actionAliases,
      consumeEffects,
    })) return true;
  }

  return item;
}

type Stat = 'agility' | 'savvy' | 'strength' | 'light_attack' | 'heavy_attack' | 'ranged_attack';
export function augment_statPotion (item: Item, stat: Stat, healthCost: number, statBoost: number, feedback: string): Item {
  item.handleItemCommand = (handlerOptions: HandlerOptions): boolean => {
    const { character, character: {name}, command, socket} = handlerOptions;
    const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  
    if ( commandMatchesKeywordsFor(command, item.keywords, REGEX_DRINK_ALIASES) ) {
      if (character.health_max <= 100 + healthCost) {
        emitOthers(`${character.name} takes a long, hard look at ${item.title}, but thinks better of it.`);
        emitSelf(`Looking into the depths of ${item.title}, you don't feel your body is strong enough to endure its effects.`);
        return true;
      }
  
      let characterUpdate: CharacterUpdateOpts = {};
      characterUpdate.health_max = character.health_max - healthCost;
      characterUpdate.health = Math.min(characterUpdate.health_max, character.health);
      characterUpdate.inventory = [ ...character.inventory ];
      characterUpdate.inventory.splice(character.inventory.indexOf(item.id), 1);
      characterUpdate[stat] = character[stat] + statBoost;
      
      if (writeCharacterData(handlerOptions, characterUpdate)) {
        emitOthers(`${name}'s skin glows for a moment and they shudder as they drink ${item.title}.`);
        emitSelf(`You gulp down ${item.title} and feel the Lifelight burning you up from the inside out.  ${feedback}`);
        return true;
      }
    }
  };

  return item;
}
