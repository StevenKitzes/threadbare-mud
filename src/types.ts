// Data types

export type Character = {
  id: string,
  user_id: string,
  name: string,
  scene_id: string,
  active: number
};

export type Exit = {
  fromId: string,
  toId: string,
  description: string,
  keywords: string[]
};

export type Item = {
  id: string;
  name: string;
};

export type Scene = {
  id: string;
  name: string;
};

export type User = {
  id: string,
  username: string,
  password: string,
  email?: string
};

// App type definitions

export type ApiResponse = {
  message: string;
  status: number;
  username?: string;
};

export type CookieKillerBody = {
  headers: { 'Set-Cookie': string },
  status: number
};

export type GameAction = {
  token: string;
  gameAction: string;
}

export type GameText = {
  gameText: string | string[];
  options?: {
    error?: boolean;
  };
}

export type LoginPayload = {
  user: string;
  pass: string;
};

export type RegistrationPayload = {
  user: string;
  pass: string;
  email: string;
};

export type ReUpResult = false | {
  user: User;
  token: string;
};
