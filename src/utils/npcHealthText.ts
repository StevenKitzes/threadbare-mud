import { firstCharToUpper } from "./firstCharToUpper";

export function npcHealthText(name: string, health: number, health_max: number): string {
  if (health <= 0) {
    return `The remains of ${name} lie here.`;
  } else if (health < health_max * 0.25) {
    return `${firstCharToUpper(name)} looks as though they are on the edge of death.`;
  } else if (health < health_max * 0.5) {
    return `${firstCharToUpper(name)} appears to be seriously injured and in significant pain`;
  } else if (health < health_max * 0.75) {
    return `${firstCharToUpper(name)} winces in some apparent pain.`;
  } else {
    return `${firstCharToUpper(name)} appears to be in good health.`;
  }
}

export default npcHealthText;
