import { IsString } from "class-validator";
import { Roles } from "../types";

export class AuthenticatedDto {
  @IsString()
  user_id: string;
  @IsString()
  role: Roles;
  iat?: number;
  exp?: number;
}
