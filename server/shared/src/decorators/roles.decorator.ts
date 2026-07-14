// shared/src/decorators/roles.decorator.ts
import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { Roles } from "../types";
import { JwtGuard } from "../guards/jwt.guard";
import { RolesGuard } from "../guards/roles.guard";

export const ROLES_KEY = "roles";

export const AllowedRoles = (...roles: Roles[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtGuard, RolesGuard),
  );
