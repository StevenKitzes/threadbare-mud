import { Character } from "../types";

export function characterHealthText(character: Character): string {
  if (character.health < character.health_max * 0.25) {
    return `=You feel as though you are on the edge of death.=`;
  } else if (character.health < character.health_max * 0.5) {
    return `You are seriously injured and in significant pain.`;
  } else if (character.health < character.health_max * 0.75) {
    return `You are injured enough to wince in pain.`;
  } else {
    return `You feel you are in good health.`;
  }
}

export default characterHealthText;
