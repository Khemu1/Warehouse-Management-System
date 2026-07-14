import {
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsString()
  sku: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unit_price: number;

  @IsNumber()
  @Min(0)
  low_stock_threshold: number;
}

export class UpdateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsString()
  sku: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unit_price: number;

  @IsNumber()
  @Min(0)
  low_stock_threshold: number;
}

export class UpdateProductMessageDto {
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsString()
  sku: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unit_price: number;

  @IsNumber()
  @Min(0)
  low_stock_threshold: number;
}
