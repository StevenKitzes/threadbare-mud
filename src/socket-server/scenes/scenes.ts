import { navigateCharacter } from '../../../sqlite/sqlite';
import { REGEX_GO_ALIASES } from '../../constants';
import { Character, SceneSentiment } from '../../types';
import characterCanMove from '../../utils/encumbrance';
import getGameTextObject, { OptsType } from '../../utils/getGameTextObject';
import { makeMatcher } from '../../utils/makeMatcher';
import { ItemIds } from '../items/items';
import { HandlerOptions } from '../server';

export type Scene = {
  id: SceneIds;
  title: string;
  sentiment: SceneSentiment;
  horseAllowed: boolean;
  publicInventory: ItemIds[];
  handleSceneCommand: (handlerOptions: HandlerOptions) => boolean;
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
  IXPANNE_WEST_MARKET = "9",
  IXPANNE_NORTHWEST_MARKET = "10",
}

import('./cold-bedroom').then(scene => {scenes.set(scene.id, scene);});
import('./magnificent-library').then(scene => scenes.set(scene.id, scene));
import('./curving-stone-staircase').then(scene => scenes.set(scene.id, scene));
import('./class-selection').then(scene => scenes.set(scene.id, scene));
import('./outside-audrics-tower').then(scene => scenes.set(scene.id, scene));
import('./north-of-audrics-tower').then(scene => scenes.set(scene.id, scene));
import('./south-of-audrics-tower').then(scene => scenes.set(scene.id, scene));
import('./west-of-audrics-tower').then(scene => scenes.set(scene.id, scene));
import('./ixpanne-west-market').then(scene => scenes.set(scene.id, scene));
import('./ixpanne-northwest-market').then(scene => scenes.set(scene.id, scene));

export default { scenes }

export function navigate(
  handlerOptions: HandlerOptions,
  destination: SceneIds,
  targetAliases: string,
  emitOthers: (text: string | string[], opts?: OptsType) => void,
  departureString: string,
): boolean {
  const { command, character, socket } = handlerOptions;

  if (command.match(makeMatcher(REGEX_GO_ALIASES, targetAliases))) {
    // before letting the character try to move, check encumbrance
    if (!characterCanMove(character)) {
      // others
      socket.to(character.scene_id).emit('game-text', getGameTextObject(`${character.name} is carrying so much that they are unable to move, however hard they may try.`));
      // self
      socket.emit('game-text', getGameTextObject( "You are carrying so much that you cannot take another step." ));
  
      return true;
    }
    
    if (navigateCharacter(character.id, destination)) {
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
