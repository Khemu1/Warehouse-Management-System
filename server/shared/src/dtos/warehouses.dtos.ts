import { IsNumber, IsString, IsUUID, Min, MinLength } from "class-validator";

export class CreateWarehouseDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  location: string;

  @IsNumber()
  @Min(1)
  capacity: number;
}

export class UpdateWarehouseDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  location: string;

  @IsNumber()
  @Min(1)
  capacity: number;
}

export class UpdateWarehouseMessageDto {
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  location: string;

  @IsNumber()
  @Min(1)
  capacity: number;
}
