export function itemPriceRandomizer(baseValue: number, baseOverride?: number): number {
  const baseMultiplier: number = baseOverride && baseOverride <= 1 && baseOverride > 0 ? baseOverride : 0.8;
  const baseRandomizer: number = (1 - baseMultiplier) * 2;
  return Math.ceil(baseValue * baseMultiplier) + Math.ceil(Math.random() * baseValue * baseRandomizer);  
}
