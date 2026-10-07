import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "../users/users.service";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;

    if (typeof header !== "string" || !header.trim()) {
      throw new UnauthorizedException("Missing or invalid access token");
    }

    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      throw new UnauthorizedException("Missing or invalid access token");
    }

    const token = match[1].trim();
    if (!token) {
      throw new UnauthorizedException("Missing or invalid access token");
    }

    const user = this.usersService.findByToken(token);
    if (!user) {
      throw new UnauthorizedException("Missing or invalid access token");
    }

    request.user = user;
    return true;
  }
}
