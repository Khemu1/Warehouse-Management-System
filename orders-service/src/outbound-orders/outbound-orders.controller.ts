import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OutboundOrdersService } from './outbound-orders.service';
import {
  CreateOutboundOrderDto,
  UpdateOutboundOrderDto,
} from '@shared/dtos/outbound-order.dtos';

@Controller()
export class OutboundOrdersController {
  constructor(private readonly outboundOrdersService: OutboundOrdersService) {}

  @MessagePattern('createOutboundOrder')
  create(@Payload() createOutboundOrderDto: CreateOutboundOrderDto) {
    return this.outboundOrdersService.create(createOutboundOrderDto);
  }

  @MessagePattern('findAllOutboundOrders')
  findAll() {
    return this.outboundOrdersService.findAll();
  }

  @MessagePattern('findOneOutboundOrder')
  findOne(@Payload() id: number) {
    return this.outboundOrdersService.findOne(id);
  }

  @MessagePattern('updateOutboundOrder')
  update(@Payload() updateOutboundOrderDto: UpdateOutboundOrderDto) {
    return this.outboundOrdersService.update(updateOutboundOrderDto);
  }

  @MessagePattern('removeOutboundOrder')
  remove(@Payload() id: number) {
    return this.outboundOrdersService.remove(id);
  }
}
