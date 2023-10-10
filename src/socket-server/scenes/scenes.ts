import { HandlerOptions } from '../server';

export type Scene = {
  id: string;
  title: string;
  publicInventory: string[];
  handleSceneCommand: (handlerOptions: HandlerOptions) => boolean;
};

export const scenes: Map<string, Scene> = new Map<string, Scene>();

export enum SceneIds {
  COLD_BEDROOM = "1",
  MAGNIFICENT_LIBRARY = "2",
  CURVING_STONE_STAIRCASE = "3",
  CLASS_SELECTION = "4",
}

import('./cold-bedroom').then(scene => {scenes.set(scene.id, scene);});
import('./magnificent-library').then(scene => scenes.set(scene.id, scene));
import('./curving-stone-staircase').then(scene => scenes.set(scene.id, scene));
import('./class-selection').then(scene => scenes.set(scene.id, scene));

export default {
  scenes
}
