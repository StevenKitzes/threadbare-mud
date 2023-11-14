import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { NpcIds } from './npcs';
import { Faction } from '../../types';
import { log } from '../../utils/log';

export type NpcImport = {
  id: NpcIds,
  name: string,
  cashLoot: number | undefined,
  xp: number | undefined,
  healthMax: number | undefined,
  agility: number | undefined,
  strength: number | undefined,
  savvy: number | undefined,
  damageValue: number | undefined,
  armor: number | undefined,
  keywords: string,
  description: string,
  talkText: string,
  attackDescription: string,
  faction: Faction,
};

enum Column {
  id = 0,
  name = 1,
  cashLoot = 2,
  xp = 3,
  healthMax = 4,
  agility = 5,
  strength = 6,
  savvy = 7,
  damageValue = 8,
  armor = 9,
  keywords = 10,
  description = 11,
  talkText = 12,
  attackDescription = 13,
  faction = 14,
}

export const npcImports: Map<NpcIds, NpcImport> = new Map<NpcIds, NpcImport>();

export function readNpcCsv(callback?: () => void) {
  createReadStream('./src/socket-server/npcs/npcs.csv')
    .pipe(parse({ delimiter: ';' }))
    .on('data', (data) => {
      if (data[Column.id] === 'id') return;
      const npcImport: NpcImport = {
        id: data[Column.id],
        name: data[Column.name],
        cashLoot: parseInt(data[Column.cashLoot]),
        xp: parseInt(data[Column.xp]),
        healthMax: parseInt(data[Column.healthMax]),
        agility: parseInt(data[Column.agility]),
        strength: parseInt(data[Column.strength]),
        savvy: parseInt(data[Column.savvy]),
        damageValue: parseInt(data[Column.damageValue]),
        armor: parseInt(data[Column.armor]),
        keywords: data[Column.keywords],
        description: data[Column.description],
        talkText: data[Column.talkText],
        attackDescription: data[Column.attackDescription],
        faction: data[Column.faction],
      };
      if (isNaN(npcImport.cashLoot)) npcImport.cashLoot = undefined;
      if (isNaN(npcImport.xp)) npcImport.xp = undefined;
      if (isNaN(npcImport.healthMax)) npcImport.healthMax = undefined;
      if (isNaN(npcImport.agility)) npcImport.agility = undefined;
      if (isNaN(npcImport.strength)) npcImport.strength = undefined;
      if (isNaN(npcImport.savvy)) npcImport.savvy = undefined;
      if (isNaN(npcImport.damageValue)) npcImport.damageValue = undefined;
      if (isNaN(npcImport.armor)) npcImport.armor = undefined;
      npcImports.set(npcImport.id, npcImport);
    })
    .on('end', () => {
      log('NPCs imported.');
      if (callback) callback();
    });
}
