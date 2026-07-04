import { IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";
import { AuthenticatedDto } from "./base.dto";

export class CreateProductDto extends AuthenticatedDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsString()
  sku: string;
  @IsNumber()
  unit_price: number;

  @IsNumber()
  @Min(0)
  low_stock_threshold: number;
}

export class UpdateProductDto extends CreateProductDto {
  @IsString()
  id: string;
}
