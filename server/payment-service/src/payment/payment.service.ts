import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from '@shared/dtos/payment.dto';
import { Payment } from './entities/payment.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { OutboundOrderStatus, type ISafeClient } from '@shared/types';
import { PaymentStatus } from '@shared/types';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('ORDERS_SERVICE') private orderClient: ISafeClient,
    @InjectRepository(Payment) private repo: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const order = await this.orderClient.send('findOneOutboundOrder', {
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

    // 1. Claim the slot FIRST — before any charge attempt.
    //    Only one concurrent request can win this insert.
    const payment = this.repo.create({
      order_id: order.id,
      total_amount: order.total_amount,
      status: PaymentStatus.PENDING,
    });
    try {
      await this.repo.save(payment);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as any).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'a payment is already in progress for this order',
        );
      }
      throw err;
    }

    try {
      payment.status = PaymentStatus.CONFIRMED;
      return await this.repo.save(payment);
    } catch (err) {
      payment.status = PaymentStatus.FAILED;
      await this.repo.save(payment);
      throw err;
    }
  }

  async retry(paymentId: string) {
    const payment = await this.repo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.CONFIRMED) {
      throw new ConflictException('Payment already confirmed');
    }

    payment.status = PaymentStatus.PENDING;
    await this.repo.save(payment);

    try {
      payment.status = PaymentStatus.CONFIRMED;
      return await this.repo.save(payment);
    } catch {
      payment.status = PaymentStatus.FAILED;
      await this.repo.save(payment);
      throw new ConflictException('Payment failed');
    }
  }
  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<Pagination<Payment>> {
    const queryBuilder = this.repo
      .createQueryBuilder('payment')
      .select([
        'payment.id',
        'payment.order_id',
        'payment.status',
        'payment.payment_method',
        'payment.total_amount',
        'payment.created_at',
      ])
      .orderBy('payment.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    return paginate<Payment>(queryBuilder, { page, limit });
  }

  async findOne(id: string) {
    return await this.repo.findOne({
      where: { id },
      select: {
        id: true,
        order_id: true,
        status: true,
        payment_method: true,
        total_amount: true,
        created_at: true,
      },
    });
  }
  async findOneForOrder(order_id: string) {
    return await this.repo.findOne({
      where: { order_id },
      select: {
        id: true,
        order_id: true,
        status: true,
        payment_method: true,
        total_amount: true,
        created_at: true,
      },
    });
  }

  async getStats() {
    const result = await this.repo
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.total_amount), 0)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.CONFIRMED })
      .andWhere('payment.created_at >= CURRENT_DATE')
      .getRawOne();

    return { revenueToday: parseFloat(result?.total || '0') };
  }
}
