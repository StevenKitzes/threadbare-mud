import { HandlerOptions } from "../socket-server/server";
import { DamageType, Item, ItemTypes, items } from '../socket-server/items/items';
import { ArmorType, NPC } from "../socket-server/npcs/npcs";
import getEmitters from "./emitHelper";
import { writeCharacterData } from "../../sqlite/sqlite";
import { SceneIds, scenes } from "../socket-server/scenes/scenes";
import npcHealthText from "./npcHealthText";
import characterHealthText from "./characterHealthText";
import { xpAmountString } from "./levelingStrings";

const COMBAT_TIMER: number = 2000;

export const startCombat = (npc: NPC, handlerOptions: HandlerOptions) => {
  const { character, socket } = handlerOptions;
  const { emitOthers, emitSelf } = getEmitters(socket, character.scene_id);
  const combatScene: string = character.scene_id;

  function isCombatOver(): boolean {
    // If character has fled
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
      if (writeCharacterData(character.id, { health: character.health_max, scene_id: SceneIds.COLD_BEDROOM })) {
        character.health = character.health_max;

        socket.leave(combatScene);
        character.scene_id = SceneIds.COLD_BEDROOM;
        socket.join(SceneIds.COLD_BEDROOM);
        
        scenes.get(SceneIds.COLD_BEDROOM)?.handleSceneCommand({
          ...handlerOptions,
          command: 'enter'
        });
      }
      return true;
    }

    return false;
  }

  function characterAttack() {
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
    defenseWithDodge = defense + (Math.random() * ((npc.agility + npc.savvy) / 2));

    // Final values
    attack = Math.random() * attack;
    defense = Math.random() * defense;
    defenseWithDodge = Math.random() * defenseWithDodge;
    damage = Math.ceil(Math.random() * damage);
    console.info(`Final combat round values in Character attack:
      attack: ${attack}
      defense: ${defense}
      defenseWithDodge: ${defenseWithDodge}
      damage: ${damage}`);

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
    defense +=
      items.get(character.headgear || '')?.armorValue || 0;
      items.get(character.armor || '')?.armorValue || 0;
      items.get(character.gloves || '')?.armorValue || 0;
      items.get(character.legwear || '')?.armorValue || 0;
      items.get(character.footwear || '')?.armorValue || 0;
    defenseWithDodge = defense + (Math.random() * ((character.agility + character.savvy) / 2));

    // Final values
    defenseWithDodge = Math.random() * defenseWithDodge;
    damage = Math.ceil(Math.random() * damage);
    console.info(`Final combat round values in NPC attack:
      attack: ${attack}
      defense: ${defense}
      defenseWithDodge: ${defenseWithDodge}
      damage: ${damage}`);

    // Handle result and output
    if (attack > defenseWithDodge && writeCharacterData(character.id, { health: character.health - damage})) {
      // handle hit
      character.health -= damage;
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

  npc.setCombatInterval(setInterval(() => {
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
      `/ \\ / \\ / \\`
    ]);
  }, COMBAT_TIMER));
}

export default startCombat;
