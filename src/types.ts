// Data types

export type Item = {
  id: string;
  name: string;
};

export type Scene = {
  id: string;
  name: string;
}

// App type definitions

export type ApiResponse = {
  status: number;
  message: string;
}

export type RegistrationPayload = {
  user: string;
  pass: string;
  email: string;
}
