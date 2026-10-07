export enum Role {
  Admin = 'admin',
  Member = 'member',
  Viewer = 'viewer',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  token: string; // secret! must never appear in an API response
}

export type PublicUser = Omit<User, 'token'>;
