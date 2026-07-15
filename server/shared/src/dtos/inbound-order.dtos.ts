import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { AuthenticatedDto } from "./base.dto";
import { Type } from "class-transformer";

export class CreateInboundOrderItemDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  expected_quantity: number;

  @IsNumber()
  @Min(0)
  unit_cost: number;
}

export class ReceiveInboundItemDto {
  @IsUUID()
  item_id: string;

  @IsInt()
  @Min(0)
  received_quantity: number;
}

// HTTP — what the client sends (no user_id, it comes from JWT)
export class CreateInboundOrderDto {
  @IsUUID()
  warehouse_id: string;

  @IsString()
  supplier_name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInboundOrderItemDto)
  items: CreateInboundOrderItemDto[];
}

// HTTP — what the client sends for receive (no order_id, it's in the URL)
export class ReceiveInboundOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiveInboundItemDto)
  items: ReceiveInboundItemDto[];
}

// Internal message — gateway → orders service for create
export class CreateInboundOrderMessageDto extends AuthenticatedDto {
  @IsUUID()
  warehouse_id: string;

  @IsString()
  supplier_name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInboundOrderItemDto)
  items: CreateInboundOrderItemDto[];
}

// Internal message — gateway → orders service for receive
export class ReceiveInboundOrderMessageDto extends AuthenticatedDto {
  @IsUUID()
  order_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiveInboundItemDto)
  items: ReceiveInboundItemDto[];
}
