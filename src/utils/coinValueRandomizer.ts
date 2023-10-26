/* The term 'base' here refers to some percentage of the source coin value we are given.
 * This base will be augmented with a random value to generate a random coin value orbiting
 * somewhere around the source coin value.
 */

export function coinValueRandomizer(sourceCoinValue: number, basePercentageOverride?: number): number {
  // If we have an override, and the override is in the correct range (0, 1], set the base multiplier to the override.
  const baseMultiplier: number =
    basePercentageOverride &&
    basePercentageOverride <= 1 &&
    basePercentageOverride > 0 ?
      basePercentageOverride :
      0.8;
  
  // Set the base using Math.ceil to prevent values of zero.
  const base: number = Math.ceil(sourceCoinValue * baseMultiplier);

  /* This (0, 1] normalized randomizer will allow for a randomization factor equal to twice
   * the distance from the base to the source.  In other words, if the source was 100 and the
   * base 80, the distance would be 20, so the range would be 40, yielding values from 81 to 120
   * (due to Math.ceil).
   */
  const baseRandomizer: number = (1 - baseMultiplier) * 2;

  return base +
    Math.ceil(
      Math.random() * sourceCoinValue * baseRandomizer
    );
}
