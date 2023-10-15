import items, { Item } from "../socket-server/items/items";
import { Character, EffectStat } from "../types";

export function initializeCharacter(character: Character): void {
  function statFunctionFactory (startingStat: number | null, effectStat: EffectStat): () => number {
    return function (): number {
      let stat: number = startingStat === null ? 0 : startingStat;
      const now: number = Date.now();
  
      for (let i = character.temporaryEffects.length - 1; i >= 0; i++) {
        stat +=
          character.temporaryEffects[i].stat === effectStat ?
          character.temporaryEffects[i].amount : 0;
      }
  
      const headgear: Item | undefined = items.get(character.headgear || '');
      const armor: Item | undefined = items.get(character.armor || '');
      const gloves: Item | undefined = items.get(character.gloves || '');
      const legwear: Item | undefined = items.get(character.legwear || '');
      const footwear: Item | undefined = items.get(character.footwear || '');
      const weapon: Item | undefined = items.get(character.weapon || '');
      const offhand: Item | undefined = items.get(character.offhand || '');

      if (headgear !== undefined && headgear.statEffects !== undefined)
        headgear.statEffects.forEach(effect => stat += effect.stat === effectStat ? effect.amount : 0);
      if (armor !== undefined && armor.statEffects !== undefined)
      armor.statEffects.forEach(effect => stat += effect.stat === effectStat ? effect.amount : 0);
      if (gloves !== undefined && gloves.statEffects !== undefined)
      gloves.statEffects.forEach(effect => stat += effect.stat === effectStat ? effect.amount : 0);
      if (legwear !== undefined && legwear.statEffects !== undefined)
      legwear.statEffects.forEach(effect => stat += effect.stat === effectStat ? effect.amount : 0);
      if (footwear !== undefined && footwear.statEffects !== undefined)
      footwear.statEffects.forEach(effect => stat += effect.stat === effectStat ? effect.amount : 0);
      if (weapon !== undefined && weapon.statEffects !== undefined)
      weapon.statEffects.forEach(effect => stat += effect.stat === effectStat ? effect.amount : 0);
      if (offhand !== undefined && offhand.statEffects !== undefined)
      offhand.statEffects.forEach(effect => stat += effect.stat === effectStat ? effect.amount : 0);
  
      return stat;
    }
  }

  character.getLightAttack = statFunctionFactory(character.light_attack, EffectStat.lightAttack);
  character.getHeavyAttack = statFunctionFactory(character.heavy_attack, EffectStat.heavyAttack);
  character.getRangedAttack = statFunctionFactory(character.ranged_attack, EffectStat.rangedAttack);
  character.getAgility = statFunctionFactory(character.agility, EffectStat.agility);
  character.getStrength = statFunctionFactory(character.strength, EffectStat.strength);
  character.getSavvy = statFunctionFactory(character.savvy, EffectStat.savvy);
  character.getDamageEffect = statFunctionFactory(null, EffectStat.damage);
  character.getAccuracyEffect = statFunctionFactory(null, EffectStat.accuracy);
  character.getDefenseEffect = statFunctionFactory(null, EffectStat.defense);
  character.getDodgeEffect = statFunctionFactory(null, EffectStat.dodge);
  character.getArmorEffect = statFunctionFactory(null, EffectStat.armor);
}

export default initializeCharacter;
