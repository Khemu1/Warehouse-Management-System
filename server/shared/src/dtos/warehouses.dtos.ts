import {
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { AuthenticatedDto } from "./base.dto";

export class CreateWarehouseDto extends AuthenticatedDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(5)
  location: string;

  @IsNumber()
  @Min(10)
  capacity: number;
}

export class UpdateWharehouseDto extends CreateWarehouseDto {
  @IsString()
  id: string;
}
