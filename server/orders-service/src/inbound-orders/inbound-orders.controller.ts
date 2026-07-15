import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { InboundOrdersService } from './inbound-orders.service';
import {
  CreateInboundOrderMessageDto,
  ReceiveInboundOrderMessageDto,
} from '@shared/dtos/inbound-order.dtos';

@Controller()
export class InboundOrdersController {
  constructor(private readonly inboundOrdersService: InboundOrdersService) {}

  @MessagePattern('createInboundOrder')
  async create(@Payload() createInboundOrderDto: CreateInboundOrderMessageDto) {
    return await this.inboundOrdersService.create(createInboundOrderDto);
  }

  @MessagePattern('receiveInboundOrder')
  async receive(
    @Payload() receiveInboundOrderDto: ReceiveInboundOrderMessageDto,
  ) {
    return await this.inboundOrdersService.receive(receiveInboundOrderDto);
  }

  @MessagePattern('cancelInboundOrder')
  async cancelInboundOrder(@Payload() data: { id: string }) {
    await this.inboundOrdersService.cancel(data.id);
    return {};
  }

  @MessagePattern('findAllInboundOrders')
  async findAll(
    @Payload()
    data: {
      page: number;
      limit: number;
      search: string;
      warehouse_id?: string;
    },
  ) {
    return await this.inboundOrdersService.findAll(
      data.page,
      data.limit,
      data.search,
      data.warehouse_id,
    );
  }
  @MessagePattern('findOneInboundOrder')
  async findOne(@Payload() data: { id: string }) {
    return await this.inboundOrdersService.findOne(data.id);
  }

  @EventPattern('inboundItemStockAdded')
  async handleStockAdded(
    @Payload() data: { order_id: string; item_id: string },
  ) {
    await this.inboundOrdersService.checkAndComplete(data.order_id);
  }

  @EventPattern('inboundItemStockFailed')
  async markAttention(
    @Payload()
    data: {
      order_id: string;
      item_id: string;
      reason?: string;
      attempts?: number;
    },
  ) {
    return await this.inboundOrdersService.markNeedsAttention(data);
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
