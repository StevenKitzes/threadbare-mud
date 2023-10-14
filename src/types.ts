// Data types

import { ItemIds } from "./socket-server/items/items";
import { SceneIds } from "./socket-server/scenes/scenes";

export type Stories = {
  main: number;
};

export type Character = {
  id: string;
  user_id: string;
  name: string;
  job: string | null,
  health: number,
  health_max: number,
  light_attack: number,
  heavy_attack: number,
  ranged_attack: number,
  agility: number,
  strength: number,
  savvy: number,
  scene_id: SceneIds;
  checkpoint_id: SceneIds,
  active: number;
  stories: Stories;       // kvp object - key is story name, value is integer denoting progress
  scene_states: any;      // kvp object - key is scene id enum, value is a state defined by that scene
  money: number;
  inventory: ItemIds[];    // simple list of item enums, duplicates allowed
  headgear: ItemIds | null;
  armor: ItemIds | null;
  gloves: ItemIds | null;
  legwear: ItemIds | null;
  footwear: ItemIds | null;
  weapon: ItemIds | null;
  offhand: ItemIds | null;
  xp: number;
  horse: Horse | null;
};

export type Horse = {
  name: string;
  saddlebagsId: ItemIds;
  inventory: ItemIds[];
}

export type User = {
  id: string;
  username: string;
  password: string;
  email?: string;
};

export type StoryProgress = {
  main: number;
};

export enum ClassTypes {
  weaver = 'weaver',
  peacemaker = 'peacemaker',
  skyguard = 'skyguard',
  ranger = 'ranger',
  spymaster = 'spymaster',
  rogue = 'rogue'
};

export enum XpAmounts {
  insignificant = 10,
  tiny = 25,
  small = 50,
  fair = 100,
  good = 200,
  great = 400,
  massive = 1000
};

export enum LevelingThresholds {
  lowest = 8,
  lower = 10,
  low = 13,
  high = 16,
  higher = 20,
  highest = 25
};

export enum SceneSentiment {
  remote,
  neutral,
  favorPeacemakers,
  favorRangers,
  favorRogues,
  favorSkyguard,
  favorSpymasters,
  favorWeavers
}

// App type definitions

export type ApiResponse = {
  message: string;
  status: number;
  username?: string;
};

export type CharacterUpdateOpts = {
  job?: string,
  health?: number,
  health_max?: number,
  light_attack?: number,
  heavy_attack?: number,
  ranged_attack?: number,
  agility?: number,
  strength?: number,
  savvy?: number,
  scene_id?: SceneIds,
  stories?: Stories;
  scene_states?: any;
  money?: number;
  inventory?: ItemIds[];
  headgear?: ItemIds;
  armor?: ItemIds;
  gloves?: ItemIds;
  legwear?: ItemIds;
  footwear?: ItemIds;
  weapon?: ItemIds;
  offhand?: ItemIds;
  xp?: number;
  horse?: Horse;
};

export type CookieKillerBody = {
  headers: { 'Set-Cookie': string };
  status: number;
};

export type CreateCharacterPayload = {
  name: string;
};

export type GameAction = {
  token: string;
  gameAction: string;
};

export type GameText = {
  gameText: string | string[];
  options?: {
    echo?: boolean;
    error?: boolean;
    other?: boolean;
  };
};

export type InventoryDescriptionHelper = {
  id: ItemIds;
  desc: string;
  type: string;
  count: number;
};

export type LoginPayload = {
  user: string;
  pass: string;
};

export type RegistrationPayload = {
  user: string;
  pass: string;
  email: string;
};

export type ConfirmedUser = false | {
  user: User;
};
