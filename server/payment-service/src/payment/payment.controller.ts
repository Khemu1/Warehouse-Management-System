import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '@shared/dtos/payment.dto';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern('createPayment')
  create(@Payload() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @MessagePattern('findAllPayments')
  findAll() {
    return this.paymentService.findAll();
  }

  @MessagePattern('findPaymentForOrder')
  findPaymentForOrder(@Payload() data: { id: string }) {
    return this.paymentService.findOneForOrder(data.id);
  }

  @MessagePattern('findOnePayment')
  findOne(@Payload() data: { id: string }) {
    return this.paymentService.findOne(data.id);
  }

  @MessagePattern('health.check')
  checkHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'inventory-service',
      timestamp: new Date().toISOString(),
    };
  }
}
