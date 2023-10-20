import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { DamageType, ItemIds, ItemTypes } from './items';

export type ItemImport = {
  id: ItemIds,
  title: string,
  type: ItemTypes,
  value: number,
  weight: number,
  armorValue: number | undefined,
  damageValue: number | undefined,
  damageType: DamageType | undefined,
  hitBonus: number | undefined,
  healAmount: number | undefined,
};

enum Column {
  id = 0,
  title = 1,
  type = 2,
  value = 3,
  weight = 4,
  armorValue = 5,
  damageValue = 6,
  damageType = 7,
  hitBonus = 8,
  healAmount = 9,
}

export const itemImports: Map<ItemIds, ItemImport> = new Map<ItemIds, ItemImport>();

export function readItemCsv(callback: () => void) {
  createReadStream('./src/socket-server/items/items.csv')
    .pipe(parse({ delimiter: ';' }))
    .on('data', (data) => {
      if (data[Column.id] === 'id') return;
      const itemImport: ItemImport = {
        id: data[Column.id],
        title: data[Column.title],
        type: data[Column.type],
        value: parseInt(data[Column.value]),
        weight: parseInt(data[Column.weight]),
        armorValue: parseInt(data[Column.armorValue]) || undefined,
        damageValue: parseInt(data[Column.damageValue]) || undefined,
        damageType: parseInt(data[Column.damageType]) || undefined,
        hitBonus: parseInt(data[Column.hitBonus]) || undefined,
        healAmount: parseInt(data[Column.healAmount]) || undefined
      };
      itemImports.set(itemImport.id, itemImport);
    })
    .on('end', () => {
      console.log('Items imported.');
      callback();
    });
}
