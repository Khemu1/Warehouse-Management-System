import { Roles } from "../types";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(Object.values(Roles))
  role: Roles;
}

export class UpdateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsIn(Object.values(Roles))
  role: Roles;
}

export class UpdateUserMessageDto {
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsIn(Object.values(Roles))
  role: Roles;
}
