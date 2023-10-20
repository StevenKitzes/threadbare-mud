import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { NpcIds } from './npcs';

export type NpcImport = {
  id: NpcIds,
  name: string,
  cashLoot: number,
  xp: number,
  healthMax: number,
  agility: number,
  strength: number,
  savvy: number,
  damageValue: number,
  armor: number,
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
}

export const npcImports: Map<NpcIds, NpcImport> = new Map<NpcIds, NpcImport>();

export function readNpcCsv(callback: () => void) {
  createReadStream('./src/socket-server/npcs/npcs.csv')
    .pipe(parse({ delimiter: ';' }))
    .on('data', (data) => {
      if (data[Column.id] === 'id') return;
      const npcImport: NpcImport = {
        id: data[Column.id],
        name: data[Column.name],
        cashLoot: data[Column.cashLoot],
        xp: parseInt(data[Column.xp]),
        healthMax: parseInt(data[Column.healthMax]),
        agility: parseInt(data[Column.agility]) || undefined,
        strength: parseInt(data[Column.strength]) || undefined,
        savvy: parseInt(data[Column.savvy]) || undefined,
        damageValue: parseInt(data[Column.damageValue]) || undefined,
        armor: parseInt(data[Column.armor]) || undefined,
      };
      npcImports.set(npcImport.id, npcImport);
    })
    .on('end', () => {
      console.log('NPCs imported.');
      callback();
    });
}
