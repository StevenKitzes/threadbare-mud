// Data types

export type Character = {
  id: string,
  user_id: string,
  name: string,
  scene_id: string,
  active: number,
  story_main: number,
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

export type CreateCharacterPayload = {
  name: string;
};

export type GameAction = {
  token: string;
  gameAction: string;
}

export type GameText = {
  gameText: string | string[];
  options?: {
    echo?: boolean;
    error?: boolean;
    other?: boolean;
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

export type ConfirmedUser = false | {
  user: User;
};
