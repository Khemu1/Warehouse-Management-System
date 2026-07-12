import { Type } from "class-transformer";
import {
  IsUUID,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsInt,
  IsNumber,
  IsString,
  Min,
} from "class-validator";
import { AuthenticatedDto } from "./base.dto";

export class CreateOutboundOrderItemDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
  @IsNumber()
  @Min(0)
  unit_cost: number;
}
export class CreateOutboundOrderDto extends AuthenticatedDto {
  @IsUUID()
  warehouse_id: string;

  @IsString()
  customer_name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOutboundOrderItemDto)
  items: CreateOutboundOrderItemDto[];
}

export class UpdateOutboundOrderDto extends AuthenticatedDto {}
