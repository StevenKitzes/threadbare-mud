import { writeCharacterData } from '../../../sqlite/sqlite';
import { REGEX_GO_ALIASES } from '../../constants';
import { SceneSentiment } from '../../types';
import characterCanMove from '../../utils/encumbrance';
import getGameTextObject, { OptsType } from '../../utils/getGameTextObject';
import { allTokensMatchKeywords, commandMatchesKeywordsFor } from '../../utils/makeMatcher';
import { Item, ItemIds } from '../items/items';
import { NPC } from '../npcs/npcs';
import { HandlerOptions } from '../server';

export type Scene = {
  id: SceneIds;
  title: string;
  sentiment: SceneSentiment;
  horseAllowed: boolean;
  publicInventory: ItemIds[];
  handleSceneCommand: (handlerOptions: HandlerOptions) => boolean;
  getSceneNpcs?: () => Map<string, NPC[]>;
};

export const scenes: Map<string, Scene> = new Map<string, Scene>();

export enum SceneIds {
  COLD_BEDROOM = "1",
  MAGNIFICENT_LIBRARY = "2",
  CURVING_STONE_STAIRCASE = "3",
  CLASS_SELECTION = "4",
  OUTSIDE_AUDRICS_TOWER = "5",
  NORTH_OF_AUDRICS_TOWER = "6",
  SOUTH_OF_AUDRICS_TOWER = "7",
  WEST_OF_AUDRICS_TOWER = "8",
  PARLIAMENT_WEST_MARKET = "9",
  PARLIAMENT_NORTHWEST_MARKET = "10",
  PARLIAMENT_SOUTHWEST_MARKET = "11",
  PARLIAMENT_ALCHEMY_SHOP = "12",
  PARLIAMENT_SILVERSMITH = "13",
  PARLIAMENT_DECORATIVE_ARMORY = "14",
  PARLIAMENT_NORTH_PROMENADE = "15",
  PARLIAMENT_MARKET_INN = "16",
  PARLIAMENT_NORTHEAST_MARKET = "17",
  PARLIAMENT_SOUTH_PROMENADE = "18",
  FROM_TALES_TO_TOMES = "19",
  PARLIAMENT_MARKET_GATE = "20",
}

import('./cold-bedroom').then(scene => {scenes.set(scene.id, scene);});
import('./magnificent-library').then(scene => scenes.set(scene.id, scene));
import('./curving-stone-staircase').then(scene => scenes.set(scene.id, scene));
import('./class-selection').then(scene => scenes.set(scene.id, scene));
import('./outside-audrics-tower').then(scene => scenes.set(scene.id, scene));
import('./north-of-audrics-tower').then(scene => scenes.set(scene.id, scene));
import('./south-of-audrics-tower').then(scene => scenes.set(scene.id, scene));
import('./west-of-audrics-tower').then(scene => scenes.set(scene.id, scene));
import('./parliament-west-market').then(scene => scenes.set(scene.id, scene));
import('./parliament-northwest-market').then(scene => scenes.set(scene.id, scene));
import('./parliament-southwest-market').then(scene => scenes.set(scene.id, scene));
import('./parliament-alchemy-shop').then(scene => scenes.set(scene.id, scene));
import('./parliament-silversmith').then(scene => scenes.set(scene.id, scene));
import('./parliament-decorative-armory').then(scene => scenes.set(scene.id, scene));
import('./parliament-north-promenade').then(scene => scenes.set(scene.id, scene));
import('./parliament-market-inn').then(scene => scenes.set(scene.id, scene));
import('./parliament-northeast-market').then(scene => scenes.set(scene.id, scene));
import('./parliament-south-promenade').then(scene => scenes.set(scene.id, scene));
import('./from-tales-to-tomes').then(scene => scenes.set(scene.id, scene));
import('./parliament-market-gate').then(scene => scenes.set(scene.id, scene));

export default { scenes }

export function getItemsForSaleAtScene(charId: string, sceneId: string): Item[] {
  const scene: Scene = scenes.get(sceneId);
  if (!scene || !scene.getSceneNpcs) return [];

  const sceneNpcs: Map<string, NPC[]> = scene.getSceneNpcs();
  if (!sceneNpcs) return [];

  const npcs: NPC[] = sceneNpcs.get(charId);
  if (!npcs) return [];

  const result: Item[] = [];

  for (let i = 0; i < npcs.length; i++) {
    const npc: NPC = npcs[i];
    const saleItems: Item[] | undefined = npc.getSaleItems();
    if (saleItems === undefined) continue;

    result.push(...saleItems);
  }

  return result;
}

export function navigate(
  handlerOptions: HandlerOptions,
  destination: SceneIds,
  keywords: string[],
  emitOthers: (text: string | string[], opts?: OptsType) => void,
  departureString: string,
  extraActionAliases?: string,
): boolean {
  const { command, character, socket } = handlerOptions;

  const actionAliases: string = `${REGEX_GO_ALIASES}${extraActionAliases ? `|${extraActionAliases}` : ''}`;

  if (
    commandMatchesKeywordsFor(command, keywords, actionAliases) ||
    allTokensMatchKeywords(command, keywords)
  ) {
    // before letting the character try to move, check encumbrance
    if (!characterCanMove(character)) {
      // others
      socket.to(character.scene_id).emit('game-text', getGameTextObject(`${character.name} is carrying so much that they are unable to move, however hard they may try.`));
      // self
      socket.emit('game-text', getGameTextObject( "You are carrying so much that you cannot take another step." ));
  
      return true;
    }
    
    if (writeCharacterData(character.id, { scene_id: destination })) {
      emitOthers(departureString);
      
      socket.leave(character.scene_id);
      character.scene_id = destination;
      socket.join(destination);
      
      return scenes.get(destination).handleSceneCommand({
        ...handlerOptions,
        command: 'enter'
      });
    }
  }
}
