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
}

import('../scenes/cold-bedroom').then(scene => scenes.set(scene.id, scene));
import('../scenes/magnificent-library').then(scene => scenes.set(scene.id, scene));
import('../scenes/curving-stone-staircase').then(scene => scenes.set(scene.id, scene));

export default {
  scenes
}
