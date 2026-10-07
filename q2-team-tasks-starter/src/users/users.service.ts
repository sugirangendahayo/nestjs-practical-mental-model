import { Injectable } from "@nestjs/common";
import { PublicUser, User } from "./user.entity";
import { SEED_USERS } from "./users.seed";

@Injectable()
export class UsersService {
  private readonly users: User[] = SEED_USERS.map((u) => ({ ...u }));

  findAll(): PublicUser[] {
    return this.users.map(({ token, ...user }) => user);
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findByToken(token: string): User | undefined {
    return this.users.find((u) => u.token === token);
  }
}
