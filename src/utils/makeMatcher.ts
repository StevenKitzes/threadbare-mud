import { NPC } from "../socket-server/npcs/npcs";
import { REGEX_GET_ALIASES, REGEX_GIVE_ALIASES, REGEX_HORSE_ALIASES, REGEX_SELL_ALIASES } from "../constants";

export function makeMatcher (actionAliases: string, targetAliases?: string): RegExp {
  if (!targetAliases) return new RegExp(`^(?:${actionAliases})$`);
  return new RegExp(`^(?:${actionAliases}) (?:${targetAliases})$`);
}

export function startMatcher (actionAliases: string): RegExp {
  return new RegExp(`^(?:${actionAliases}) `);
}

export function allTokensMatchKeywords (input: string, keywords: string[]): boolean {
  if (input.split(' ').every(token => keywords.includes(token))) return true;
  return false;
}

export function commandMatchesKeywordsFor (command: string, keywords: string[], regex: string): boolean {
  try {
    const capture: string | null = captureFrom(command, regex);
    if (capture === null) return false;
    if (allTokensMatchKeywords(capture, keywords)) return true;
    return false;
  } catch (err: any) {
    console.error('Error in makeMatcher.commandMatchesKeywordsFor:', err.toString());
    return false;
  }
}

export function commandMatchesKeywordsForSaleTo (command: string, keywords: string[]): boolean {
  try {
    const capture: string | null = captureSellMatch(command);
    if (capture === null) return false;
    if (allTokensMatchKeywords(capture, keywords)) return true;
    return false;
  } catch (err: any) {
    console.error('Error in makeMatcher.commandMatchesKeywordsFor:', err.toString());
    return false;
  }
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

export function captureGiveMatchWithRecipient (command: string, recipientKeywords: string[]): string | null {
  const matches: string[] | null = command.match(
    new RegExp(`^(?:${REGEX_GIVE_ALIASES}) (.*) to (.*)$`)
  );
  if (matches?.length !== 3) return null;
  if (!allTokensMatchKeywords(matches[2], recipientKeywords)) return null;
  return matches[1];
}

export function captureSellMatch (command: string): string | null {
  const matches: string[] | null = command.match(
    new RegExp(`^(?:${REGEX_SELL_ALIASES}) (.*) to (.*)$`)
  );
  if (matches?.length !== 3) return null;
  return matches[1];
}

export function captureSellItemToVendor(command: string): { itemSpecifier: string, vendorSpecifier: string } | null {
  const matches: string[] | null = command.match(
    new RegExp(`^(?:${REGEX_SELL_ALIASES}) (.*) to (.*)$`)
  );
  if (matches?.length !== 3) return null;
  return {
    itemSpecifier: matches[1],
    vendorSpecifier: matches[2]
  }
}

export function captureSellTo (command: string, npc: NPC): string | null {
  const matches: string[] | null = command.match(
    new RegExp(`^(?:${REGEX_SELL_ALIASES}) (.*) to (.*)$`)
  );
  if (matches?.length !== 3) return null;
  if (!allTokensMatchKeywords(matches[2], npc.getKeywords())) {
    return null;
  }
  return matches[1];
}

export function matchMatchesKeywords (match: string, keywords: string[]): boolean {
  if (match.split(' ').every(word => keywords.includes(word))) return true;
  return false;
}
