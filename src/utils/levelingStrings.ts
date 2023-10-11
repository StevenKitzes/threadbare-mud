import { LevelingThresholds, XpAmounts } from "../types";

export function xpAmountString(xp: number): string {
  if (xp < XpAmounts.insignificant) return 'an insignificant amount';
  if (xp < XpAmounts.tiny) return 'a tiny bit';
  if (xp < XpAmounts.small) return 'a small blessing';
  if (xp < XpAmounts.fair) return 'a fair helping';
  if (xp < XpAmounts.good) return 'a goodly measure';
  if (xp < XpAmounts.great) return 'a great bounty';
  if (xp < XpAmounts.massive) return 'an otherworldly abundance';
  return 'an unmitigated torrent';
}

export function levelRequirementString(skillLevel: number): string {
  if (skillLevel < LevelingThresholds.lowest) return 'a tiny bit';
  if (skillLevel < LevelingThresholds.lower) return 'a small blessing';
  if (skillLevel < LevelingThresholds.low) return 'a fair helping';
  if (skillLevel < LevelingThresholds.high) return 'a goodly measure';
  if (skillLevel < LevelingThresholds.higher) return 'a great bounty';
  if (skillLevel < LevelingThresholds.highest) return 'an otherworldly abundance';
  return 'an unmitigated torrent';
}
