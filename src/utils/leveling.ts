import { LevelingThresholds, XpAmounts } from "../types";

export function xpAmountString(xp: number): string {
  if (xp <= XpAmounts.insignificant) return 'an insignificant amount';
  if (xp <= XpAmounts.tiny)          return 'a tiny bit';
  if (xp <= XpAmounts.small)         return 'a small blessing';
  if (xp <= XpAmounts.fair)          return 'a fair helping';
  if (xp <= XpAmounts.good)          return 'a goodly measure';
  if (xp <= XpAmounts.great)         return 'a great bounty';
  if (xp <= XpAmounts.massive)       return 'an otherworldly abundance';
  return 'an unmitigated torrent';
}

// describe as one level higher, so players won't think they have enough xp when they don't
export function levelRequirementString(skillLevel: number): string {
  if (skillLevel < LevelingThresholds.lowest)   return 'a tiny bit';
  if (skillLevel < LevelingThresholds.lower)    return 'a small blessing';
  if (skillLevel < LevelingThresholds.low)      return 'a fair helping';
  if (skillLevel < LevelingThresholds.high)     return 'a goodly measure';
  if (skillLevel < LevelingThresholds.higher)   return 'a great bounty';
  if (skillLevel < LevelingThresholds.highest)  return 'an otherworldly abundance';
  return 'an unmitigated torrent';
}

export function getCost(skillLevel: number): number {
  if (skillLevel < LevelingThresholds.lowest) return XpAmounts.insignificant;
  if (skillLevel < LevelingThresholds.lower) return XpAmounts.tiny;
  if (skillLevel < LevelingThresholds.low) return XpAmounts.small;
  if (skillLevel < LevelingThresholds.high) return XpAmounts.fair;
  if (skillLevel < LevelingThresholds.higher) return XpAmounts.good;
  if (skillLevel < LevelingThresholds.highest) return XpAmounts.great;
  return XpAmounts.massive;
}
