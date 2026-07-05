import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InboundOrdersService } from './inbound-orders.service';
import {
  CreateInboundOrderDto,
  ReceiveInboundOrderDto,
} from '@shared/dtos/inbound-order.dtos';

@Controller()
export class InboundOrdersController {
  constructor(private readonly inboundOrdersService: InboundOrdersService) {}

  @MessagePattern('createInboundOrder')
  async create(@Payload() createInboundOrderDto: CreateInboundOrderDto) {
    return await this.inboundOrdersService.create(createInboundOrderDto);
  }

  @MessagePattern('receiveInboundOrder')
  async receive(@Payload() receiveInboundOrderDto: ReceiveInboundOrderDto) {
    return await this.inboundOrdersService.receive(receiveInboundOrderDto);
  }

  @MessagePattern('cancelInboundOrder')
  async cancelInboundOrder(@Payload() data: { id: string }) {
    await this.inboundOrdersService.cancel(data.id);
    return {};
  }

  @MessagePattern('findAllInboundOrders')
  async findAll(@Payload() data: { warehouse_id?: string }) {
    return await this.inboundOrdersService.findAll(data.warehouse_id);
  }

  @MessagePattern('findOneInboundOrder')
  async findOne(@Payload() data: { id: string }) {
    return await this.inboundOrdersService.findOne(data.id);
  }
  @MessagePattern('inboundItemStockFailed')
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
}
