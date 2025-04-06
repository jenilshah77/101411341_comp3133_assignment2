export interface User {
  id?: string;
  username: string;
  email: string;
  created_at?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}
