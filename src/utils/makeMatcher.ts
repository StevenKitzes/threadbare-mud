import { REGEX_GET_ALIASES, REGEX_GIVE_ALIASES, REGEX_HORSE_ALIASES } from "../constants";

export function makeMatcher (actionAliases: string, targetAliases?: string): RegExp {
  if (!targetAliases) return new RegExp(`^(?:${actionAliases})$`);
  return new RegExp(`^(?:${actionAliases}) (?:${targetAliases})$`);
}

export function startMatcher (actionAliases: string): RegExp {
  return new RegExp(`^(?:${actionAliases}) `);
}

export function commandMatchesKeywordsFor (command: string, keywords: string[], regex: string): boolean {
  const capture: string | null = captureFrom(command, regex);
  if (capture === null) return false;
  if (capture.split(' ').every(word => keywords.includes(word))) return true;
  return false;
}

export function captureFrom (command: string, actionAliases: string): string | null {
  const matches: string[] | null = command.match(new RegExp(`^(?:${actionAliases}) (.+)$`));
  if (matches === null) return null;
  return matches[1];
}

export function captureFrom_toHorse (command: string, horseName: string) : string | null {
  const matches: string[] | null = command.match(new RegExp(`^(?:${REGEX_GIVE_ALIASES}) (.*) to (?:${REGEX_HORSE_ALIASES}|${horseName.toLowerCase()})`));
  if (matches === null) return null;
  return matches[1];
}

export function captureFrom_fromHorse (command: string, horseName: string) : string | null {
  const matches: string[] | null = command.match(new RegExp(`^(?:${REGEX_GET_ALIASES}) (.*) from (?:${REGEX_HORSE_ALIASES}|${horseName.toLowerCase()})`));
  if (matches === null) return null;
  return matches[1];
}
