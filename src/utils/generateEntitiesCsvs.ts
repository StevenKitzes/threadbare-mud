import { writeFile } from 'fs';

import { Item } from "../socket-server/items/items";
import { NPC } from "../socket-server/npcs/npcs";

const itemsFile: string = './docs/items.csv';
const npcsFile: string = './docs/npcs.csv';

export function generateEntitiesCsvs (
  items: Map<string, Item>,
  npcFactories: Map<string, () => NPC>
): void {
  setTimeout(() => {
    const itemsColumns: string = 'title;type;value;weight;armorValue;damageValue;damageType;hitBonus';
    const itemRows: string[] = [];
    items.forEach((item) => itemRows.push([
      item.title, item.type, item.value, item.weight, item.armorValue || '', item.damageValue || '', item.damageType || '', item.hitBonus || ''
    ].join(';')));
    writeFile(itemsFile, [itemsColumns, ...itemRows].join('\n'), { flag: 'w' }, (err: any) => {
      if (err) console.error("Error writing item documentation.", err.toString());
    })
    
    const npcsColumns: string = 'name;cashLoot;xp;healthMax;agility;strength;savvy;damageValue;armor;armorType';
    const npcRows: string[] = [];
    npcFactories.forEach((factory) => {
      const npc: NPC = factory();
      npcRows.push([
        npc.name, npc.cashLoot || '', npc.xp || '', npc.healthMax || '', npc.agility || '', npc.strength || '', npc.savvy || '', npc.damageValue || '', npc.armor || '', npc.armorType || ''
      ].join(';'))
    });
    writeFile(npcsFile, [npcsColumns, ...npcRows].join('\n'), { flag: 'w' }, (err: any) => {
      if (err) console.error("Error writing npc documentation.", err.toString());
    })
  }, 3000);
}

export default generateEntitiesCsvs;
