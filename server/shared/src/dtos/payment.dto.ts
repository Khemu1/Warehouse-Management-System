import { IsString, IsUUID } from "class-validator";

export class CreatePaymentDto {
  @IsUUID()
  order_id: string;

  @IsString()
  payment_method: string;
}
