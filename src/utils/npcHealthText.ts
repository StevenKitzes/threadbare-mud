export function npcHealthText(name: string, health: number, health_max: number): string {
  if (health <= 0) {
    return `The remains of ${name} lie here.`;
  } else if (health < health_max * 0.25) {
    return `${name} looks as though they are on the edge of death.`;
  } else if (health < health_max * 0.5) {
    return `${name} appears to be seriously injured and in significant pain`;
  } else if (health < health_max * 0.75) {
    return `${name} winces in some apparent pain.`;
  } else {
    return `${name} appears to be in good health.`;
  }
}

export default npcHealthText;
