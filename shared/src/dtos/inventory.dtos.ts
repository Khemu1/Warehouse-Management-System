import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { AuthenticatedDto } from "./base.dto";
import { Type } from "class-transformer";

export class CheckStockDto {
  @IsUUID()
  warehouse_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  product_ids: string[];
}

export class StockItem {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
export class ReserveStockDto {
  @IsUUID()
  warehouse_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockItem)
  items: StockItem[];
}
