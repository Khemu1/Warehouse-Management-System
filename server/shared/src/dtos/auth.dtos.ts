import { Roles } from "../types";
import { Expose } from "class-transformer";
import { IsString, MaxLength, MinLength, IsEmail } from "class-validator";

export class AuthDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  email: string;

  @Expose()
  role: Roles;

  @Expose()
  token: string;
}


export class LoginAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(35)
  password: string;
}
