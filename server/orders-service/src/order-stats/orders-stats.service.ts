import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { InboundOrder } from '../inbound-orders/entities/inbound-order.entity';
import { OutboundOrder } from '../outbound-orders/entities/outbound-order.entity';
import { InBoundOrderStatus, OutboundOrderStatus } from '@shared/types';

@Injectable()
export class OrdersStatsService {
  constructor(
    @InjectRepository(InboundOrder)
    private inboundRepo: Repository<InboundOrder>,
    @InjectRepository(OutboundOrder)
    private outboundRepo: Repository<OutboundOrder>,
  ) {}

  async getStats() {
    const [pendingInbound, pendingOutbound, shippedToday] = await Promise.all([
      this.inboundRepo.count({ where: { status: InBoundOrderStatus.PENDING } }),
      this.outboundRepo.count({
        where: { status: OutboundOrderStatus.RESERVED },
      }),
      this.outboundRepo.count({
        where: {
          status: OutboundOrderStatus.SHIPPED,
          updated_at: Raw((alias) => `${alias} >= CURRENT_DATE`),
        },
      }),
    ]);

    return { pendingInbound, pendingOutbound, shippedToday };
  }
  async getRecentOrders() {
    const [inbound, outbound] = await Promise.all([
      this.inboundRepo.find({
        order: { created_at: 'DESC' },
        take: 5,
        select: ['id', 'supplier_name', 'status', 'total_amount', 'created_at'],
      }),
      this.outboundRepo.find({
        order: { created_at: 'DESC' },
        take: 5,
        select: ['id', 'customer_name', 'status', 'total_amount', 'created_at'],
      }),
    ]);

    const orders = [
      ...inbound.map((o) => ({ ...o, type: 'inbound', customer_name: null })),
      ...outbound.map((o) => ({ ...o, type: 'outbound', supplier_name: null })),
    ]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 10);

    return orders;
  }
}
