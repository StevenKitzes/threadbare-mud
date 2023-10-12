export function makeMatcher (actionAliases: string, targetAliases?: string): RegExp {
  if (!targetAliases) return new RegExp(`^(?:${actionAliases})$`);
  return new RegExp(`^(?:${actionAliases}) (?:${targetAliases})$`);
}

export function captureFrom (subject: string, actionAliases: string): string | null {
  const matches: string[] | null = subject.match(new RegExp(`^(?:${actionAliases}) (.+)$`));
  if (matches === null) return null;
  return matches[1];
}
