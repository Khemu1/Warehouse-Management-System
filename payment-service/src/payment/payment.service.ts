import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from '@shared/dtos/payment.dto';
import { Payment } from './entities/payment.entity';
import { Not, Repository } from 'typeorm';
import { OutboundOrderStatus, type ISafeClient } from '@shared/types';
import { PaymentStatus } from '@shared/types';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('ORDERS_SERVICE') private orderClient: ISafeClient,
    @InjectRepository(Payment) private repo: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const order: {
      id: string;
      status: OutboundOrderStatus;
      total_amount: number;
    } = await this.orderClient.send('findOneOutboundOrder', {
      id: createPaymentDto.order_id,
      withRelations: false,
      specifiedColumns: ['id', 'status', 'total_amount'],
    });
    if (!order) {
      throw new NotFoundException("order wasn't found");
    }
    if (order.status !== OutboundOrderStatus.RESERVED) {
      throw new ConflictException("the order status isn't reserved");
    }

    const existingPayment = await this.repo.findOne({
      where: {
        order_id: createPaymentDto.order_id,
        status: Not(PaymentStatus.FAILED),
      },
    });
    if (existingPayment) {
      throw new ConflictException('a payment already exists for this order');
    }

    const payment = this.repo.create({
      order_id: order.id,
      total_amount: order.total_amount,
      status: PaymentStatus.CONFIRMED,
    });
    return this.repo.save(payment);
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
