// shared/src/guards/roles.guard.ts
import {
  Inject,
  Injectable,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { Roles, JwtPayload, ISafeClient } from "../types";
import { CustomError } from "../filters/CustomError";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject("AUTH_SERVICE") private authClient: ISafeClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    const foundUser = await this.authClient.send("doesUserWithRoleExist", {
      user_id: user.user_id,
      roles: allowedRoles,
    });

    if (!foundUser) {
      throw new CustomError(
        "Not authenticated",
        401,
        "not_authenticated",
        true,
      );
    }

    if (!allowedRoles.includes(foundUser.role)) {
      throw new CustomError("Not authorized", 403, "not_authorized", true);
    }

    return allowedRoles.includes(foundUser.role);
  }
}
