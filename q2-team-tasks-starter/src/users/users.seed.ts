import { Role, User } from './user.entity';

// Fake access tokens - in a real app these would be JWTs. Do not edit (the tests use them).
export const SEED_USERS: User[] = [
  { id: 1, name: 'Amina Uwase', email: 'amina@example.com', role: Role.Admin, token: 'token-amina' },
  { id: 2, name: 'Brian Mugisha', email: 'brian@example.com', role: Role.Member, token: 'token-brian' },
  { id: 3, name: 'Chloe Ineza', email: 'chloe@example.com', role: Role.Member, token: 'token-chloe' },
  { id: 4, name: 'Diego Habimana', email: 'diego@example.com', role: Role.Viewer, token: 'token-diego' },
];
