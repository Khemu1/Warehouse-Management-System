import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @MaxLength(35)
  @MinLength(10)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(35)
  @MinLength(10)
  password: string;
}
