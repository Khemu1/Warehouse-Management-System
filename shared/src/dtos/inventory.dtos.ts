import { IsInt, IsUUID, Min } from "class-validator";
import { AuthenticatedDto } from "./base.dto";

export class CheckStockDto extends AuthenticatedDto {
  @IsUUID()
  warehouse_id: string;

  @IsUUID()
  product_id: string;
}

export class ReserveStockDto extends AuthenticatedDto {
  @IsUUID()
  warehouse_id: string;

  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
