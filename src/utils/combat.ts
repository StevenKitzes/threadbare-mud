import { HandlerOptions } from "../socket-server/server";
import { DamageType, Item, ItemTypes, items } from '../socket-server/items/items';
import { ArmorType, NPC } from "../socket-server/npcs/npcs";
import getEmitters from "./emitHelper";
import { writeCharacterData } from "../../sqlite/sqlite";
import { SceneIds, scenes } from "../socket-server/scenes/scenes";
import npcHealthText from "./npcHealthText";
import characterHealthText from "./characterHealthText";
import { xpAmountString } from "./leveling";
import { OptsType } from "./getGameTextObject";

import research from "./research";

const COMBAT_TIMER: number = 2000;

function npcReady(
  npc: NPC,
  emitSelf: (text: string | string[], opts?: OptsType | undefined) => void
): boolean {
  let ready: boolean = true;
  if ( npc.agility === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing agility stat for combat.`); }
  if ( npc.armor === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing armor stat for combat.`); }
  if ( npc.armorType === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing armorType list for combat.`); }
  if ( npc.attackDescription === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing attackDescription for combat.`); }
  if ( npc.cashLoot === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing cashLoot for combat.`); }
  if ( npc.combatInterval === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing combatInterval for combat.`); }
  if ( npc.damageValue === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing damageValue stat for combat.`); }
  if ( npc.deathTime === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing deathTime tracker for combat.`); }
  if ( npc.health === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing health stat for combat.`); }
  if ( npc.healthMax === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing healthMax stat for combat.`); }
  if ( npc.itemLoot === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing itemLoot list for combat.`); }
  if ( npc.savvy === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing savvy stat for combat.`); }
  if ( npc.setCombatInterval === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing setCombatInterval setter for combat.`); }
  if ( npc.setDeathTime === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing setDeathTime setter for combat.`); }
  if ( npc.setHealth === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing setHealth setter for combat.`); }
  if ( npc.strength === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing strength stat for combat.`); }
  if ( npc.xp === undefined ) { ready = false; console.error(`NPC ${npc.name} was missing xp stat for combat.`); }

  if (!ready) {
    emitSelf(`You are ready to fight, but ${npc.name} is not.`);
    return false;
  }

  return true;
}

export const startCombat = (npc: NPC, handlerOptions: HandlerOptions): void => {
  const { character, socket } = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  const combatScene: string = character.scene_id;
  
  // make sure this NPC has all the requisite stats to even enter combat
  if (!npcReady(npc, emitSelf)) return;
  
  function isCombatOver(): boolean {
    // this line needed for ts linting
    if (!(npc.setCombatInterval !== undefined && npc.health !== undefined && npc.setDeathTime !== undefined && npc.cashLoot !== undefined && npc.itemLoot !== undefined && npc.xp !== undefined)) return true;

    // If character has fled or died/gone to checkpoint
    if (character.scene_id !== combatScene) {
      if (npc.combatInterval !== null) clearInterval(npc.combatInterval);
      npc.setCombatInterval(null);
    }

    // if NPC is dead
    if (npc.health < 1) {
      if (npc.combatInterval !== null) clearInterval(npc.combatInterval);
      npc.setCombatInterval(null);

      npc.setDeathTime(Date.now());

      const actorText: string[] = [`You see the Lifelight fade from the eyes of ${npc.name}.`];
      emitOthers(`${character.name} has defeated ${npc.name}.`);
      if (writeCharacterData(character.id, {
        money: character.money + npc.cashLoot,
        inventory: [ ...character.inventory, ...npc.itemLoot ],
        xp: character.xp + npc.xp
      })) {
        character.money += npc.cashLoot;
        character.inventory = [ ...character.inventory, ...npc.itemLoot ];
        character.xp += npc.xp;
        actorText.push(`You feel ${xpAmountString(npc.xp)} of the Lifelight's energy coursing through you.`);
        if (npc.cashLoot > 0) actorText.push(`You collect ${npc.cashLoot} coins from ${npc.name}'s body.`);
        else actorText.push(`There are no coins to collect from ${npc.name}.`);
        npc.itemLoot.forEach(item => {
          actorText.push(`You collect {${items.get(item)?.title || 'nothing'}} from ${npc.name}'s body.`);
        });
        if (npc.itemLoot.length === 0) actorText.push(`You find no loot on ${npc.name}.`);
      }
      emitSelf(actorText);
      return true;
    }

    // if character is dead
    if (character.health < 1) {
      if (npc.combatInterval !== null) clearInterval(npc.combatInterval);
      npc.setCombatInterval(null);
      emitOthers(`${character.name} was killed by ${npc.name}!  You see their body fade away into the Lifelight.`);
      emitSelf(`You fall to ${npc.name}.  You hear a chorus of singing voices and see the Lifelight bleeding into your vision...`);
      const newHealth: number = Math.ceil(character.health_max * 0.6);
      if (writeCharacterData(character.id, {
        health: newHealth, scene_id: character.checkpoint_id, xp: 0
      })) {
        character.health = newHealth;
        character.xp = 0;

        socket.leave(combatScene);
        character.scene_id = character.checkpoint_id;
        socket.join(character.checkpoint_id);
        
        scenes.get(character.checkpoint_id)?.handleSceneCommand({
          ...handlerOptions,
          command: 'enter'
        });
      }
      return true;
    }

    return false;
  }

  function characterAttack() {
    // this line needed for ts linting
    if (!(npc.armorType !== undefined && npc.armor !== undefined && npc.agility !== undefined && npc.savvy !== undefined && npc.setHealth !== undefined && npc.health !== undefined && npc.healthMax !== undefined)) return true;

    // Initialize
    let attack = 0;
    let defense = 0;
    let defenseWithDodge = 0;
    let damage = 0;
    const actorText: string[] = [];

    // Handle weapon attributes
    const weapon: Item | undefined = items.get(character.weapon || '');
    if (weapon) {
      damage += Math.random() * (weapon.damageValue || 0);
      attack += weapon.hitBonus || 0;
      // Adjust attack based on weapon affinity and character stats
      if (weapon.type === ItemTypes.lightWeapon) {
        attack +=
          (Math.random() * character.agility) +
          (Math.random() * character.light_attack);
        damage += Math.random() * character.light_attack;
      }
      if (weapon.type === ItemTypes.heavyWeapon) {
        attack +=
          (Math.random() * character.strength) +
          (Math.random() * character.heavy_attack);
        damage += Math.random() * character.heavy_attack;
      }
      if (weapon.type === ItemTypes.rangedWeapon) {
        attack +=
          (Math.random() * ((character.agility + character.savvy) / 2)) +
          (Math.random() * character.ranged_attack);
        damage += Math.random() * character.ranged_attack;
      }
      // Adjust attack based on weapon affinity vs npc armor type
      if (weapon.damageType === DamageType.slashing) {
        if (npc.armorType.includes(ArmorType.strongVsSlashing)) {
          attack -= 3;
          actorText.push(`...${weapon.title} is weak against ${npc.name}'s defenses.`);
        }
        if (npc.armorType.includes(ArmorType.weakVsSlashing)) {
          attack += 3;
          actorText.push(`...${weapon.title} is strong against ${npc.name}'s defenses.`);
        }
      }
      if (weapon.damageType === DamageType.piercing) {
        if (npc.armorType.includes(ArmorType.strongVsPiercing)) {
          attack -= Math.random() * 5;
          actorText.push(`...${weapon.title} is weak against ${npc.name}'s defenses.`);
        }
        if (npc.armorType.includes(ArmorType.weakVsPiercing)) {
          attack += Math.random() * 5;
          actorText.push(`...${weapon.title} is strong against ${npc.name}'s defenses.`);
        }
      }
      if (weapon.damageType === DamageType.bashing) {
        if (npc.armorType.includes(ArmorType.strongVsBashing)) {
          attack -= Math.random() * 5;
          actorText.push(`...${weapon.title} is weak against ${npc.name}'s defenses.`);
        }
        if (npc.armorType.includes(ArmorType.weakVsBashing)) {
          attack += Math.random() * 5;
          actorText.push(`...${weapon.title} is strong against ${npc.name}'s defenses.`);
        }
      }
    } else {
      // Using bare hands
      attack += Math.random() * ((character.agility + character.strength) / 2);
      damage += Math.random() * character.strength;
      if (npc.armorType.includes(ArmorType.strongVsBashing)) {
        attack -= Math.random() * 5;
        actorText.push(`...your martial arts are weak against ${npc.name}'s defenses.`);
      }
      if (npc.armorType.includes(ArmorType.weakVsBashing)) {
        attack += Math.random() * 5;
        actorText.push(`...your martial arts are strong against ${npc.name}'s defenses.`);
      }
    }

    // Adjust defense based on NPC stats
    defense += npc.armor;
    defense = Math.random() * defense;
    defenseWithDodge = defense + (Math.random() * ((npc.agility + npc.savvy) / 2));

    // Final values
    attack = Math.random() * attack;
    damage = Math.ceil(Math.random() * damage);
    research.playerAttack.push([attack, damage, defense, defenseWithDodge].join(';'));

    // Handle result and output
    const item: Item | undefined = items.get(character.weapon || '');
    const weaponName: string = item === undefined ? 'an unarmed strike' : item.title;
    if (attack > defenseWithDodge) {
      // handle hit
      npc.setHealth(npc.health - damage);
      if (damage < npc.healthMax * 0.1) {
        actorText.push(`+Your attack hits+, but ${weaponName} only does negligible damage.`);
        emitOthers(`${character.name} does negligible damage to ${npc.name} with ${weaponName}.`);
      } else if (damage < npc.healthMax * 0.2) {
        actorText.push(`+Your attack hits+, inflicting light damage with ${weaponName}.`);
        emitOthers(`${character.name} does light damage to ${npc.name} with ${weaponName}.`);
      } else if (damage < npc.healthMax * 0.3) {
        actorText.push(`+Your attack hits+, doing noticeable harm with ${weaponName}.`);
        emitOthers(`${character.name} does noticeable harm to ${npc.name} with ${weaponName}.`);
      } else if (damage < npc.healthMax * 0.4) {
        actorText.push(`+Your attack hits+, causing significant damage with ${weaponName}.`);
        emitOthers(`${character.name} causes significant damage to ${npc.name} with ${weaponName}.`);
      } else if (damage < npc.healthMax * 0.5) {
        actorText.push(`+Your attack hits+ well enough to cause lasting injury with ${weaponName}.`);
        emitOthers(`${character.name} causes lasting injury to ${npc.name} with ${weaponName}.`);
      } else if (damage < npc.healthMax * 0.6) {
        actorText.push(`+Your attack hits+ hard enough with ${weaponName} to put ${npc.name} off balance.`);
        emitOthers(`${character.name} hits hard enough with ${weaponName} to put ${npc.name} off balance.`);
      } else if (damage < npc.healthMax * 0.7) {
        actorText.push(`+Your attack hits+, doing substantial damage with ${weaponName}.`);
        emitOthers(`${character.name} does substantial damage to ${npc.name} with ${weaponName}.`);
      } else if (damage < npc.healthMax * 0.8) {
        actorText.push(`+Your attack hits+, doing heavy damage and staggering ${npc.name} with ${weaponName}.`);
        emitOthers(`${character.name} does heavy damage and staggers ${npc.name} with ${weaponName}.`);
      } else if (damage < npc.healthMax * 0.9) {
        actorText.push(`+Your attack hits+, causing massive damage with ${weaponName}.`);
        emitOthers(`${character.name} causes massive damage to ${npc.name} with ${weaponName}.`);
      } else if (damage < npc.healthMax) {
        actorText.push(`+Your attack hits+ almost hard enough with ${weaponName} to kill ${npc.name} with a single strike.`);
        emitOthers(`${character.name} hits almost hard enough with ${weaponName} to kill ${npc.name} in one strike.`);
      } else {
        actorText.push(`+Your attack hits+ with enough force to kill ${npc.name} in a single strike with ${weaponName}!`);
        emitOthers(`${character.name} hits with enough force to kill ${npc.name} in a single strike with ${weaponName}!`);
      }
    } else if (attack > defense) {
      // handle dodge
      actorText.push(`Your attack with ${weaponName} goes wide as {${npc.name} evades}.`);
      emitOthers(`${character.name} attacks with ${weaponName} but ${npc.name} evades.`);
    } else {
      // handle miss
      actorText.push(`Your attack with ${weaponName} {misses}.`);
      emitOthers(`${character.name} attacks ${npc.name} with ${weaponName} but misses the mark.`);
    }
    emitSelf(actorText);
  }

  function npcAttack() {
    // this line needed for ts linting
    if (!(npc.agility !== undefined && npc.strength !== undefined && npc.savvy !== undefined && npc.damageValue !== undefined && npc.healthMax !== undefined)) return true;

    // Initialize
    let attack = 0;
    let defense = 0;
    let defenseWithDodge = 0;
    let damage = 0;
    const actorText: string[] = [];
    
    // Calculate attack
    attack += Math.random() * ((npc.agility + npc.strength + npc.savvy) / 3);
    
    // Calculate damage
    damage += Math.random() * (npc.damageValue);

    // Calculate player defense
    defense += items.get(character.headgear || '')?.armorValue || 0;
    defense += items.get(character.armor || '')?.armorValue || 0;
    defense += items.get(character.gloves || '')?.armorValue || 0;
    defense += items.get(character.legwear || '')?.armorValue || 0;
    defense += items.get(character.footwear || '')?.armorValue || 0;
    defense = Math.random() * defense;
    defenseWithDodge = defense + (Math.random() * ((character.agility + character.savvy) / 2));

    // Final values
    damage = Math.ceil(Math.random() * damage);
    research.npcAttack.push([npc.name, attack, damage, defense, defenseWithDodge].join(';'));

    // if this is a hit, how much should max health increase?
    const healthBoost: number = Math.floor(damage / (character.health_max / 10))

    // Handle result and output
    if (attack > defenseWithDodge && writeCharacterData(character.id, {
      health: character.health - damage,
      health_max: character.health_max + healthBoost
    })) {
      // handle hit
      character.health -= damage;
      character.health_max += healthBoost;
      if (damage < character.health_max * 0.1) {
        actorText.push(`=You are hit= by ${npc.attackDescription}, but only endure negligible damage.`);
        emitOthers(`${character.name} endures negligible damage from ${npc.attackDescription}.`);
      } else if (damage < character.health_max * 0.2) {
        actorText.push(`=You are hit= by ${npc.attackDescription}, enduring light damage.`);
        emitOthers(`${character.name} endures light damage from ${npc.attackDescription}.`);
      } else if (damage < character.health_max * 0.3) {
        actorText.push(`=You are hit= by ${npc.attackDescription}, enduring noticeable harm.`);
        emitOthers(`${character.name} endures noticeable harm from ${npc.attackDescription}.`);
      } else if (damage < character.health_max * 0.4) {
        actorText.push(`=You are hit= by ${npc.attackDescription}, enduring significant damage.`);
        emitOthers(`${character.name} endures significant damage from ${npc.attackDescription}.`);
      } else if (damage < character.health_max * 0.5) {
        actorText.push(`=You are hit= by ${npc.attackDescription} hard enough to endure lasting injury.`);
        emitOthers(`${character.name} endures lasting injury from ${npc.attackDescription}.`);
      } else if (damage < character.health_max * 0.6) {
        actorText.push(`=You are hit= by ${npc.attackDescription} hard enough to be thrown off balance.`);
        emitOthers(`${character.name} is thrown off balance by ${npc.attackDescription}.`);
      } else if (damage < character.health_max * 0.7) {
        actorText.push(`=You are hit= by ${npc.attackDescription}, enduring substantial damage.`);
        emitOthers(`${character.name} endures substantial damage from ${npc.attackDescription}.`);
      } else if (damage < character.health_max * 0.8) {
        actorText.push(`=You are hit= by ${npc.attackDescription}, enduring heavy enough damage that your are staggered.`);
        emitOthers(`${character.name} endures heavy enough damage to be staggered by ${npc.attackDescription}.`);
      } else if (damage < npc.healthMax * 0.9) {
        actorText.push(`=You are hit= by ${npc.attackDescription}, enduring massive damage.`);
        emitOthers(`${character.name} endures massive damage from ${npc.attackDescription}.`);
      } else if (damage < npc.healthMax) {
        actorText.push(`=You are hit= by ${npc.attackDescription} almost hard enough to be killed with a single strike.`);
        emitOthers(`${character.name} is hit by ${npc.attackDescription} almost hard enough to be killed in one strike.`);
      } else {
        actorText.push(`=You are hit= by ${npc.attackDescription} with enough force to kill you in a single strike!`);
        emitOthers(`${character.name} is hit by ${npc.attackDescription} with enough force to be killed in a single strike!`);
      }
    } else if (attack > defense) {
      // handle dodge
      actorText.push(`You are nearly struck by ${npc.attackDescription} but {you are able to evade} the attack.`);
      emitOthers(`${character.name} dodges ${npc.attackDescription}.`);
    } else {
      // handle miss
      actorText.push(`An attack by ${npc.attackDescription} {misses you}.`);
      emitOthers(`${character.name} hardly seems worried as an attack by ${npc.attackDescription} misses the mark.`);
    }
    emitSelf(actorText);
  }

  if (npc.setCombatInterval === undefined) return;
  npc.setCombatInterval(setInterval(() => {
    // this garbage needed to satisfy ts linting
    if (!(npc.agility !== undefined && npc.health !== undefined && npc.healthMax !== undefined && npc.setCombatInterval !== undefined)) {
      if (npc.combatInterval) clearInterval(npc.combatInterval);
      return;
    }

    // If character has fled or died/gone to checkpoint
    if (character.scene_id !== combatScene) {
      if (npc.combatInterval !== null) clearInterval(npc.combatInterval);
      npc.setCombatInterval(null);
      return;
    }

    // determine who hits first
    if (Math.random() * character.agility > Math.random() * npc.agility) {
      characterAttack();
      if (isCombatOver()) return;
      npcAttack();
      if (isCombatOver()) return;
    } else {
      npcAttack();
      if (isCombatOver()) return;
      characterAttack();
      if (isCombatOver()) return;
    }
    emitSelf([
      npcHealthText(npc.name, npc.health, npc.healthMax),
      characterHealthText(character),
      `= - = - = - = - = - =`
    ]);
  }, COMBAT_TIMER));
}

export default startCombat;
