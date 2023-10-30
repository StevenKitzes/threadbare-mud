import { NpcImport } from "../socket-server/npcs/csvNpcImport";
import { ItemImport } from "../socket-server/items/csvItemImport";

export function csvItemToKeywords (csvData: ItemImport): string[] {
  const titleNoPunct: string = csvData.title.replace(/[,:’'\-~\[\]]/g, '').toLowerCase();
  const keywords: string[] = titleNoPunct.split(' ');
  keywords.push(csvData.type);
  if (csvData.keywords) keywords.push(...csvData.keywords.split(' '));
  return keywords;
}

export function csvNpcToKeywords (csvData: NpcImport): string[] {
  const nameNoPunct: string = csvData.name.replace(/[,:’'\-~\[\]]/g, '').toLowerCase();
  const keywords: string[] = nameNoPunct.split(' ');
  if (csvData.keywords) keywords.push(...csvData.keywords.split(' '));
  return keywords;
}
