import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OutboundOrdersService } from './outbound-orders.service';
import { CreateOutboundOrderDto } from '@shared/dtos/outbound-order.dtos';
import { OutboundOrder } from './entities/outbound-order.entity';

@Controller()
export class OutboundOrdersController {
  constructor(private readonly outboundOrdersService: OutboundOrdersService) {}

  @MessagePattern('createOutboundOrder')
  async create(@Payload() createOutboundOrderDto: CreateOutboundOrderDto) {
    return await this.outboundOrdersService.create(createOutboundOrderDto);
  }

  @MessagePattern('confirmOutboundOrder')
  async confirm(@Payload() data: { id: string; user_id: string }) {
    return await this.outboundOrdersService.confirm(data.id, data.user_id);
  }

  @MessagePattern('cancelOutboundOrder')
  async cancelOutboundOrder(@Payload() data: { id: string; user_id: string }) {
    await this.outboundOrdersService.cancel(data.id, data.user_id);
    return {};
  }

  @MessagePattern('findAllOutboundOrders')
  async findAll(@Payload() data: { warehouse_id?: string }) {
    return await this.outboundOrdersService.findAll(data.warehouse_id);
  }

  @MessagePattern('findOneOutboundOrder')
  async findOne(
    @Payload()
    data: {
      id: string;
      returnAll?: boolean;
      specifiedColumns?: (keyof OutboundOrder)[];
      withRelations?: boolean;
    },
  ) {
    return await this.outboundOrdersService.findOne(data);
  }

  @EventPattern('outboundItemStockFailed')
  async markAttention(
    @Payload()
    data: {
      order_id: string;
      item_id: string;
      reason?: string;
      attempts?: number;
    },
  ) {
    return await this.outboundOrdersService.markNeedsAttention(data);
  }

  @MessagePattern('health.check')
  checkHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'outbound-orders-service',
      timestamp: new Date().toISOString(),
    };
  }
}
