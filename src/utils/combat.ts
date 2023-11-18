import { HandlerOptions } from "../socket-server/server";
import { DamageType, Item, ItemTypes, items } from '../socket-server/items/items';
import { ArmorType, NPC, NpcIds } from "../socket-server/npcs/npcs";
import getEmitters from "./emitHelper";
import { writeCharacterData } from "../../sqlite/sqlite";
import { Scene, scenes } from "../socket-server/scenes/scenes";
import npcHealthText from "./npcHealthText";
import characterHealthText from "./characterHealthText";
import { xpAmountString } from "./leveling";
import { OptsType } from "./getGameTextObject";

import research from "./research";
import { Character, CharacterUpdateOpts, Faction, FactionAnger } from "../types";
import { firstUpper } from "./firstUpper";
import { AGGRO_TIMER, factionNames } from "../constants";
import { error, log, logParts } from "./log";

const COMBAT_TIMER: number = 1900;
const COMBAT_RANDOMIZATION: number = 200;
const FACTION_ANGER_DURATION: number = 300000; // five minutes

function npcReady(
  npc: NPC,
  emitSelf: (text: string | string[], opts?: OptsType | undefined) => void
): boolean {
  let ready: boolean = true;
  if ( npc.getAgility() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing agility stat for combat.`); }
  if ( npc.getArmor() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing armor stat for combat.`); }
  if ( npc.getArmorType() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing armorType list for combat.`); }
  if ( npc.getAttackDescription() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing attackDescription for combat.`); }
  if ( npc.getCashLoot() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing cashLoot for combat.`); }
  if ( npc.getCombatInterval() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing combatInterval for combat.`); }
  if ( npc.getDamageValue() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing damageValue stat for combat.`); }
  if ( npc.getDeathTime() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing deathTime tracker for combat.`); }
  if ( npc.getHealth() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing health stat for combat.`); }
  if ( npc.getHealthMax() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing healthMax stat for combat.`); }
  if ( npc.getItemLoot() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing itemLoot list for combat.`); }
  if ( npc.getSavvy() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing savvy stat for combat.`); }
  if ( npc.setCombatInterval === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing setCombatInterval setter for combat.`); }
  if ( npc.setDeathTime === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing setDeathTime setter for combat.`); }
  if ( npc.setHealth === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing setHealth setter for combat.`); }
  if ( npc.getStrength() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing strength stat for combat.`); }
  if ( npc.getXp() === undefined ) { ready = false; error(`NPC ${npc.getName()} was missing xp stat for combat.`); }

  if (!ready) {
    emitSelf(`You are ready to fight, but ${npc.getName()} is not.`);
    return false;
  }

  return true;
}

export function handleAggro(
  npcs: NPC[],
  character: Character,
  handlerOptions: HandlerOptions
): void {
  const { emitSelf } = getEmitters(handlerOptions.socket, character.scene_id);

  // Aggro enemies attack!
  npcs.forEach(c => {
    if (c.getHealth() && c.getHealth() > 0 && c.getAggro()) {
      emitSelf(`={${firstUpper(c.getName())}} looks ready to attack you!  Flee now or you'll enter combat!=`);
      setTimeout(() => {
        c.handleNpcFight({
          ...handlerOptions,
          command: `fight ${c.getKeywords().join(' ')}`
        });
      }, AGGRO_TIMER);
    }
  });
}

export function handleFactionAggro(
  characterNpcs: Map<string, NPC[]>,
  character: Character,
  handlerOptions: HandlerOptions,
  emitOthers: (text: string | string[], opts?: OptsType) => void,
  emitSelf: (text: string | string[], opts?: OptsType) => void
): void {
  // Angered faction enemies attack!
  characterNpcs.get(character.id)?.forEach(c => {
    if (c.getHealth() && c.getHealth() > 0 && character.factionAnger.find(fa => fa.faction === c.getFaction())) {
      emitOthers(`${firstUpper(c.getName())} remembers ${character.name} as an enemy of ${factionNames.get(c.getFaction())} and attacks!`);
      emitSelf(`=${firstUpper(c.getName())} {recognizes you} as an enemy of ${factionNames.get(c.getFaction())} and prepares to attack!  Flee or you'll enter combat!=`);
      setTimeout(() => {
        c.handleNpcFight({
          ...handlerOptions,
          command: `fight ${c.getKeywords().join(' ')}`
        });
      }, AGGRO_TIMER);
    }
  });
}

function fightAllInSceneExcept(
  character: Character,
  npcFaction: Faction,
  npcId: NpcIds,
  handlerOptions: HandlerOptions
): void {
  const combatScene: Scene | undefined = scenes.get(character.scene_id);
  if (!combatScene || !combatScene.getSceneNpcs) return;
  const npcs: NPC[] | undefined = combatScene.getSceneNpcs().get(character.id);
  if (npcs === undefined) return;
  
  npcs.forEach(c => {
    if (c.getHealth() && c.getHealth() > 0 && c.getFaction() === npcFaction && c.getId() !== npcId) {
      c.handleNpcCustom({
        ...handlerOptions,
        command: `fight ${c.getKeywords().join(' ')}`
      });
    }
  });
}

export const startCombat = (npc: NPC, handlerOptions: HandlerOptions): void => {
  const { character, socket } = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);

  if (npc.getFaction()) {
    // if character has not already angered this faction
    if (!character.factionAnger.find(fa => fa.faction === npc.getFaction())) {
      const characterUpdate: CharacterUpdateOpts = {};
      characterUpdate.factionAnger = [
        ...character.factionAnger,
        { faction: npc.getFaction(), expiry: Date.now() + FACTION_ANGER_DURATION } as FactionAnger
      ];
      if (writeCharacterData(handlerOptions, characterUpdate)) {
        emitOthers(`${character.name} has enraged ${npc.getFaction()}!`);
        emitSelf(`=You have enraged {${npc.getFaction()}} and you may be +attacked on sight+!=`);
        fightAllInSceneExcept(character, npc.getFaction(), npc.getId(), handlerOptions);
      }
    }
  }
  
  // make sure this NPC has all the requisite stats to even enter combat
  if (!npcReady(npc, emitSelf)) return;
  
  function isCombatOver(): boolean {
    // this line needed for ts linting
    if (!(npc.setCombatInterval !== undefined && npc.getHealth() !== undefined && npc.setDeathTime !== undefined && npc.getCashLoot() !== undefined && npc.getItemLoot() !== undefined && npc.getXp() !== undefined)) return true;

    // If character has fled or died/gone to checkpoint
    if (character.scene_id !== npc.getSceneId()) {
      const interval: NodeJS.Timeout | null = npc.getCombatInterval();
      if (interval !== null) clearInterval(interval);
      npc.setCombatInterval(null);
    }

    // if NPC is dead
    if (npc.getHealth() < 1) {
      const interval: NodeJS.Timeout | null = npc.getCombatInterval();
      if (interval !== null) clearInterval(interval);
      npc.setCombatInterval(null);

      npc.setDeathTime(Date.now());

      // Call this once rather than as a reference since it generates a random amount relative to npc's cashLoot definition
      const cashLoot: number = npc.getCashLoot();

      const actorText: string[] = [`You see the Lifelight fade from the eyes of ${npc.getName()}.`];
      emitOthers(`${character.name} has defeated ${npc.getName()}.`);
      if (writeCharacterData(handlerOptions, {
        money: character.money + cashLoot,
        inventory: [ ...character.inventory, ...npc.getItemLoot() ],
        xp: character.xp + npc.getXp()
      })) {
        actorText.push(`You feel ${xpAmountString(npc.getXp())} of the Lifelight's energy coursing through you.`);
        if (cashLoot > 0) actorText.push(`You collect ${cashLoot} coins from ${npc.getName()}'s body.`);
        else actorText.push(`There are no coins to collect from ${npc.getName()}.`);
        npc.getItemLoot().forEach(item => {
          actorText.push(`You collect {${items.get(item)?.title || 'nothing'}} from ${npc.getName()}'s body.`);
        });
        if (npc.getItemLoot().length === 0) actorText.push(`You find no loot on ${npc.getName()}.`);
      }
      emitSelf(actorText);
      return true;
    }

    // if character is dead
    if (character.health < 1) {
      const interval: NodeJS.Timeout | null = npc.getCombatInterval();
      if (interval !== null) clearInterval(interval);
      npc.setCombatInterval(null);
      emitOthers(`${character.name} was killed by ${npc.getName()}!  You see their body fade away into the Lifelight.`);
      emitSelf(`You fall to ${npc.getName()}.  You hear a chorus of singing voices and see the Lifelight bleeding into your vision...`);
      const newHealth: number = Math.ceil(character.health_max * 0.6);
      if (writeCharacterData(handlerOptions, {
        health: newHealth, scene_id: character.checkpoint_id, xp: 0
      })) {
        socket.leave(character.scene_id);
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

  function characterAttack(): void {
    // this line needed for ts linting
    if (!(npc.getArmorType() !== undefined && npc.getArmor() !== undefined && npc.getAgility() !== undefined && npc.getSavvy() !== undefined && npc.setHealth !== undefined && npc.getHealth() !== undefined && npc.getHealthMax() !== undefined && character.getAccuracyEffect !== null && character.getAgility !== null && character.getDamageEffect !== null && character.getHeavyAttack !== null && character.getLightAttack !== null && character.getRangedAttack !== null && character.getSavvy !== null && character.getStrength !== null)) return;

    // Initialize with getters
    let attack = character.getAccuracyEffect ? character.getAccuracyEffect() : 0;
    let damage = character.getDamageEffect ? character.getDamageEffect() : 0;
    let defense = 0;
    let defenseWithDodge = 0;
    const actorText: string[] = [];
    const otherText: string[] = [];

    // Handle weapon attributes
    const weapon: Item | undefined = items.get(character.weapon || '');
    if (weapon) {
      damage += Math.random() * (weapon.damageValue || 0);
      attack += weapon.hitBonus || 0;
      // Adjust attack based on weapon affinity and character stats
      if (weapon.type === ItemTypes.lightWeapon) {
        attack +=
          (Math.random() * character.getAgility()) +
          (Math.random() * character.getLightAttack());
        damage += Math.random() * character.getLightAttack();
      }
      if (weapon.type === ItemTypes.heavyWeapon) {
        attack +=
          (Math.random() * character.getStrength()) +
          (Math.random() * character.getHeavyAttack());
        damage += Math.random() * character.getHeavyAttack();
      }
      if (weapon.type === ItemTypes.rangedWeapon) {
        attack +=
          (Math.random() * ((character.getAgility() + character.getSavvy()) / 2)) +
          (Math.random() * character.getRangedAttack());
        damage += Math.random() * character.getRangedAttack();
      }
      // Adjust attack based on weapon affinity vs npc armor type
      if (weapon.damageType === DamageType.slashing) {
        if (npc.getArmorType().includes(ArmorType.strongVsSlashing)) {
          attack -= 3;
          actorText.push(`...${weapon.title} is weak against ${npc.getName()}'s defenses.`);
        }
        if (npc.getArmorType().includes(ArmorType.weakVsSlashing)) {
          attack += 3;
          actorText.push(`...${weapon.title} is strong against ${npc.getName()}'s defenses.`);
        }
      }
      if (weapon.damageType === DamageType.piercing) {
        if (npc.getArmorType().includes(ArmorType.strongVsPiercing)) {
          attack -= Math.random() * 5;
          actorText.push(`...${weapon.title} is weak against ${npc.getName()}'s defenses.`);
        }
        if (npc.getArmorType().includes(ArmorType.weakVsPiercing)) {
          attack += Math.random() * 5;
          actorText.push(`...${weapon.title} is strong against ${npc.getName()}'s defenses.`);
        }
      }
      if (weapon.damageType === DamageType.bashing) {
        if (npc.getArmorType().includes(ArmorType.strongVsBashing)) {
          attack -= Math.random() * 5;
          actorText.push(`...${weapon.title} is weak against ${npc.getName()}'s defenses.`);
        }
        if (npc.getArmorType().includes(ArmorType.weakVsBashing)) {
          attack += Math.random() * 5;
          actorText.push(`...${weapon.title} is strong against ${npc.getName()}'s defenses.`);
        }
      }
    } else {
      // Using bare hands
      attack += Math.random() * ((character.getAgility() + character.getStrength()) / 2);
      damage += Math.random() * character.getStrength();
      if (npc.getArmorType().includes(ArmorType.strongVsBashing)) {
        attack -= Math.random() * 5;
        actorText.push(`...your martial arts are weak against ${npc.getName()}'s defenses.`);
      }
      if (npc.getArmorType().includes(ArmorType.weakVsBashing)) {
        attack += Math.random() * 5;
        actorText.push(`...your martial arts are strong against ${npc.getName()}'s defenses.`);
      }
    }

    // Adjust defense based on NPC stats
    defense += npc.getArmor();

    // handle multiple attacks for dextrous characters with light weapons
    let attacks: number = 1;
    if (weapon === undefined || weapon.type === ItemTypes.lightWeapon) {
      attacks = Math.floor(Math.random() * ((character.getAgility() + character.getLightAttack()) / 10)) + 1;
    }
    for (let i = 0; i < attacks; i++) {
      // Final values
      defense = Math.random() * defense;
      defenseWithDodge = defense + (Math.random() * ((npc.getAgility() + npc.getSavvy()) / 2));

      attack = Math.random() * attack;
      damage = Math.ceil(Math.random() * damage);
      research.playerAttack.push([attack, damage, defense, defenseWithDodge].join(';'));

      // Handle result and output
      const item: Item | undefined = items.get(character.weapon || '');
      const weaponName: string = item === undefined ? 'an unarmed strike' : item.title;
      if (attack > defenseWithDodge) {
        // handle hit
        npc.setHealth(npc.getHealth() - damage);
        if (damage < npc.getHealthMax() * 0.1) {
          actorText.push(`+Your attack hits+, but ${weaponName} only does negligible damage.`);
          otherText.push(`${character.name} does negligible damage to ${npc.getName()} with ${weaponName}.`);
        } else if (damage < npc.getHealthMax() * 0.2) {
          actorText.push(`+Your attack hits+, inflicting light damage with ${weaponName}.`);
          otherText.push(`${character.name} does light damage to ${npc.getName()} with ${weaponName}.`);
        } else if (damage < npc.getHealthMax() * 0.3) {
          actorText.push(`+Your attack hits+, doing noticeable harm with ${weaponName}.`);
          otherText.push(`${character.name} does noticeable harm to ${npc.getName()} with ${weaponName}.`);
        } else if (damage < npc.getHealthMax() * 0.4) {
          actorText.push(`+Your attack hits+, causing significant damage with ${weaponName}.`);
          otherText.push(`${character.name} causes significant damage to ${npc.getName()} with ${weaponName}.`);
        } else if (damage < npc.getHealthMax() * 0.5) {
          actorText.push(`+Your attack hits+ well enough to cause lasting injury with ${weaponName}.`);
          otherText.push(`${character.name} causes lasting injury to ${npc.getName()} with ${weaponName}.`);
        } else if (damage < npc.getHealthMax() * 0.6) {
          actorText.push(`+Your attack hits+ hard enough with ${weaponName} to put ${npc.getName()} off balance.`);
          otherText.push(`${character.name} hits hard enough with ${weaponName} to put ${npc.getName()} off balance.`);
        } else if (damage < npc.getHealthMax() * 0.7) {
          actorText.push(`+Your attack hits+, doing substantial damage with ${weaponName}.`);
          otherText.push(`${character.name} does substantial damage to ${npc.getName()} with ${weaponName}.`);
        } else if (damage < npc.getHealthMax() * 0.8) {
          actorText.push(`+Your attack hits+, doing heavy damage and staggering ${npc.getName()} with ${weaponName}.`);
          otherText.push(`${character.name} does heavy damage and staggers ${npc.getName()} with ${weaponName}.`);
        } else if (damage < npc.getHealthMax() * 0.9) {
          actorText.push(`+Your attack hits+, causing massive damage with ${weaponName}.`);
          otherText.push(`${character.name} causes massive damage to ${npc.getName()} with ${weaponName}.`);
        } else if (damage < npc.getHealthMax()) {
          actorText.push(`+Your attack hits+ almost hard enough with ${weaponName} to kill ${npc.getName()} with a single strike.`);
          otherText.push(`${character.name} hits almost hard enough with ${weaponName} to kill ${npc.getName()} in one strike.`);
        } else {
          actorText.push(`+Your attack hits+ with enough force to kill ${npc.getName()} in a single strike with ${weaponName}!`);
          otherText.push(`${character.name} hits with enough force to kill ${npc.getName()} in a single strike with ${weaponName}!`);
        }
      } else if (attack > defense) {
        // handle dodge
        actorText.push(`Your attack with ${weaponName} goes wide as {${npc.getName()} evades}.`);
        otherText.push(`${character.name} attacks with ${weaponName} but ${npc.getName()} evades.`);
      } else {
        // handle miss
        actorText.push(`Your attack with ${weaponName} {misses}.`);
        otherText.push(`${character.name} attacks ${npc.getName()} with ${weaponName} but misses the mark.`);
      }
    }
    emitOthers(otherText);
    emitSelf(actorText);
  }

  function npcAttack() {
    // this line needed for ts linting
    if (!(npc.getAgility() !== undefined && npc.getStrength() !== undefined && npc.getSavvy() !== undefined && npc.getDamageValue() !== undefined && npc.getHealthMax() !== undefined && character.getDefenseEffect !== null && character.getDodgeEffect !== null && character.getArmorEffect !== null)) return true;

    // Initialize
    let attack = 0;
    let damage = 0;
    let defense = character.getDefenseEffect() + character.getArmorEffect();
    let defenseWithDodge = defense + character.getDodgeEffect();
    const actorText: string[] = [];
    
    // Calculate attack
    attack += Math.random() * ((npc.getAgility() + npc.getStrength() + npc.getSavvy()) / 3);
    
    // Calculate damage
    damage += Math.random() * npc.getDamageValue();

    // Calculate player defense
    defense += items.get(character.headgear || '')?.armorValue || 0;
    defense += items.get(character.armor || '')?.armorValue || 0;
    defense += items.get(character.gloves || '')?.armorValue || 0;
    defense += items.get(character.legwear || '')?.armorValue || 0;
    defense += items.get(character.footwear || '')?.armorValue || 0;
    defense += items.get(character.weapon || '')?.armorValue || 0;
    defense += items.get(character.offhand || '')?.armorValue || 0;
    defense = Math.random() * defense;
    defenseWithDodge = defense + (Math.random() * ((character.agility + character.savvy) / 2));

    // Final values
    damage = Math.ceil(Math.random() * damage);
    research.npcAttack.push([npc.getName(), attack, damage, defense, defenseWithDodge].join(';'));

    // if this is a hit, how much should max health increase?
    const healthBoost: number = Math.floor(damage / (character.health_max / 10))

    // Handle result and output
    if (attack > defenseWithDodge && writeCharacterData(handlerOptions, {
      health: character.health - damage,
      health_max: character.health_max + healthBoost
    })) {
      // handle hit
      if (damage < character.health_max * 0.1) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()}, but only endure negligible damage.`);
        emitOthers(`${character.name} endures negligible damage from ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max * 0.2) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()}, enduring light damage.`);
        emitOthers(`${character.name} endures light damage from ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max * 0.3) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()}, enduring noticeable harm.`);
        emitOthers(`${character.name} endures noticeable harm from ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max * 0.4) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()}, enduring significant damage.`);
        emitOthers(`${character.name} endures significant damage from ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max * 0.5) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()} hard enough to endure lasting injury.`);
        emitOthers(`${character.name} endures lasting injury from ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max * 0.6) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()} hard enough to be thrown off balance.`);
        emitOthers(`${character.name} is thrown off balance by ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max * 0.7) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()}, enduring substantial damage.`);
        emitOthers(`${character.name} endures substantial damage from ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max * 0.8) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()}, enduring heavy enough damage that your are staggered.`);
        emitOthers(`${character.name} endures heavy enough damage to be staggered by ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max * 0.9) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()}, enduring massive damage.`);
        emitOthers(`${character.name} endures massive damage from ${npc.getAttackDescription()}.`);
      } else if (damage < character.health_max) {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()} almost hard enough to be killed with a single strike.`);
        emitOthers(`${character.name} is hit by ${npc.getAttackDescription()} almost hard enough to be killed in one strike.`);
      } else {
        actorText.push(`=You are hit= by ${npc.getAttackDescription()} with enough force to kill you in a single strike!`);
        emitOthers(`${character.name} is hit by ${npc.getAttackDescription()} with enough force to be killed in a single strike!`);
      }
    } else if (attack > defense) {
      // handle dodge
      actorText.push(`You are nearly struck by ${npc.getAttackDescription()} but {you are able to evade} the attack.`);
      emitOthers(`${character.name} dodges ${npc.getAttackDescription()}.`);
    } else {
      // handle miss
      actorText.push(`An attack by ${npc.getAttackDescription()} {misses you}.`);
      emitOthers(`${character.name} hardly seems worried as an attack by ${npc.getAttackDescription()} misses the mark.`);
    }
    emitSelf(actorText);
  }

  if (npc.setCombatInterval === undefined) return;
  npc.setCombatInterval(setInterval(() => {
    // this garbage needed to satisfy ts linting
    if (!(npc.getAgility() !== undefined && npc.getHealth() !== undefined && npc.getHealthMax() !== undefined && npc.setCombatInterval !== undefined)) {
      const interval: NodeJS.Timeout | null = npc.getCombatInterval();
      if (interval !== null) clearInterval(interval);
      return;
    }

    // If character has fled or died/gone to checkpoint
    if (character.scene_id !== npc.getSceneId()) {
      const interval: NodeJS.Timeout | null = npc.getCombatInterval();
      if (interval !== null) clearInterval(interval);
      npc.setCombatInterval(null);
      return;
    }

    // determine who hits first
    if (Math.random() * character.agility > Math.random() * npc.getAgility()) {
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
      npcHealthText(npc.getName(), npc.getHealth(), npc.getHealthMax()),
      characterHealthText(character),
      `=- - - - - - -=`
    ]);
  }, Math.ceil(Math.random() * COMBAT_RANDOMIZATION) + COMBAT_TIMER));
}

export default startCombat;
