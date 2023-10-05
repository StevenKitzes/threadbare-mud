// Data types

export type Stories = {
  main: number;
};

export type Character = {
  id: string;
  user_id: string;
  name: string;
  scene_id: string;
  active: number;
  stories: Stories;       // kvp object - key is story name, value is integer denoting progress
  scene_states: any;      // kvp object - key is scene id enum, value is a state defined by that scene
  money: number;
  inventory: string[];    // simple list of item enums, duplicates allowed
  headgear?: string;
  armor?: string;
  gloves?: string;
  legwear?: string;
  footwear?: string;
  weapon?: string;
  offhand?: string;
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
