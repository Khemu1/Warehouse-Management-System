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
  findAll(@Payload() data: { page: number; limit: number; status?: string }) {
    return this.paymentService.findAll(data.page, data.limit, data.status);
  }

  @MessagePattern('findPaymentForOrder')
  findPaymentForOrder(@Payload() data: { id: string }) {
    console.log('find payment for order ', data);
    return this.paymentService.findOneForOrder(data.id);
  }

  @MessagePattern('findOnePayment')
  findOne(@Payload() data: { id: string }) {
    return this.paymentService.findOne(data.id);
  }

  @MessagePattern('getPaymentStats')
  async getPaymentStats() {
    return this.paymentService.getStats();
  }
  @MessagePattern('retryPayment')
  async retry(@Payload() data: { id: string }) {
    return this.paymentService.retry(data.id);
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
