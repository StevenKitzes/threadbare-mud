import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { items, DamageType, ItemIds, ItemTypes, Item } from './items';
import { csvItemToKeywords } from '../../utils/csvPropsToKeywords';
import { itemPriceRandomizer } from '../../utils/itemPriceRandomizer';
import { HandlerOptions } from '../server';

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
  keywords: string | undefined,
  description: string,
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
  keywords = 10,
  description = 11,
}

export function readItemCsv(callback?: () => void) {
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
        damageType: data[Column.damageType],
        hitBonus: parseInt(data[Column.hitBonus]) || undefined,
        healAmount: parseInt(data[Column.healAmount]) || undefined,
        keywords: data[Column.keywords],
        description: data[Column.description],
      };
      itemFactory(itemImport);
    })
    .on('end', () => {
      console.log('Items imported.');
      if (callback) callback();
    });
}

function itemFactory (csvData: ItemImport): Item {
  let value: number;

  const randomizeValue = (): number => {
    value = itemPriceRandomizer(csvData.value);
    return value;
  }

  value = randomizeValue();

  const getValue = (): number => {
    return value;
  }

  const item: Item = {
    id: csvData.id,
    type: csvData.type,
    title: csvData.title,
    description: csvData.description,
    keywords: csvItemToKeywords(csvData),
    getValue,
    randomizeValue,
    weight: csvData.weight,
    armorValue: csvData.armorValue,
    damageValue: csvData.damageValue,
    damageType: csvData.damageType,
    hitBonus: csvData.hitBonus,
    handleItemCommand: (handlerOptions: HandlerOptions) => false,
    quest: false,
    healAmount: csvData.healAmount,
    consumeEffects: [],
    statEffects: [],
  }

  items.set(item.id, item);

  return item;
}
