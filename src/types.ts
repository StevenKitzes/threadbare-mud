// Data types

export type Item = {
  id: string;
  name: string;
};

export type Scene = {
  id: string;
  name: string;
}

export type User = {
  id: string,
  username: string,
  password: string,
  email?: string,
  session_token?: string,
  session_expiry?: number
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
