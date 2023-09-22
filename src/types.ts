// Data types

export type Character = {
  id: string,
  user_id: string,
  name: string,
  scene_id: string,
  active: number,
};

export type Item = {
  id: string;
  name: string;
};

export type Scene = {
  id: string;
  name: string;
}

export type SceneInventory = {
  scene: Scene;
  inventory: Item[];
}

export type User = {
  id: string,
  username: string,
  password: string,
  email?: string,
  characters?: Character[]
}

// App type definitions

export type ApiResponse = {
  status: number;
  message: string;
}

export type LoginPayload = {
  user: string;
  pass: string;
}

export type RegistrationPayload = {
  user: string;
  pass: string;
  email: string;
}
