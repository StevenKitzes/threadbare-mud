import { writeFile } from "fs";

const research: {
  playerAttack: string[],
  npcAttack: string[],
} = {
  playerAttack: ['attack;damage;npcDefense;npcDefenseWithDodge'],
  npcAttack: ['npc;attack;damage;playerDefense;playerDefenseWithDodge'],
}

setInterval(() => {
  writeFile('./docs/player-attacks.csv', research.playerAttack.join('\n'), { flag: 'w' }, (err: any) => {
    if (err) console.error("Error writing player attack documentation.", err.toString());
  });
  writeFile('./docs/npc-attacks.csv', research.npcAttack.join('\n'), { flag: 'w' }, (err: any) => {
    if (err) console.error("Error writing npc attack.", err.toString());
  });
}, 1000 * 60);

export default research;
