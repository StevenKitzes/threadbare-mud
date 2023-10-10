// Data types

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
  scene_id: string;
  checkpoint_id: string,
  active: number;
  stories: Stories;       // kvp object - key is story name, value is integer denoting progress
  scene_states: any;      // kvp object - key is scene id enum, value is a state defined by that scene
  money: number;
  inventory: string[];    // simple list of item enums, duplicates allowed
  headgear: string | null;
  armor: string | null;
  gloves: string | null;
  legwear: string | null;
  footwear: string | null;
  weapon: string | null;
  offhand: string | null;
};

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
}

// App type definitions

export type ApiResponse = {
  message: string;
  status: number;
  username?: string;
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
  id: string;
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
