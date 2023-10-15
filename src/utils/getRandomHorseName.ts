export function getRandomHorseName(): string {
  const names: string[] = [
    "Sparkle",
    "Daisy",
    "Biscuit",
    "Buttercup",
    "Peanut",
    "River",
    "Cinnamon",
    "Honey",
    "Popcorn",
    "Marshmallow",
    "Cupcake",
    "Sprinkles",
    "Twinkle",
    "Clover",
    "Pudding",
    "Gingersnap",
    "Snowflake",
    "Windy",
    "Jellybean",
    "Muffin",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

export default getRandomHorseName;
