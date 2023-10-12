import { SceneSentiment } from '../../types';
import { HandlerOptions } from '../server';

export type Scene = {
  id: string;
  title: string;
  sentiment: SceneSentiment;
  publicInventory: string[];
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

export default {
  scenes
}
