import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { Roles } from "../auth/roles.decorator";
import { Role, User } from "./user.entity";
import { UsersService } from "./users.service";

@Roles(Role.Admin)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @Roles(Role.Admin, Role.Member, Role.Viewer)
  me(@CurrentUser() user: User) {
    const currentUser = this.usersService.findById(user.id);
    if (!currentUser) {
      return null;
    }
    const { token, ...safeUser } = currentUser;
    return safeUser;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
