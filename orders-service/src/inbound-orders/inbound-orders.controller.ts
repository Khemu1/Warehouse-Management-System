import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InboundOrdersService } from './inbound-orders.service';
import {
  CreateInboundOrderDto,
  UpdateInboundOrderDto,
} from '@shared/dtos/inbound-order.dtos';

@Controller()
export class InboundOrdersController {
  constructor(private readonly inboundOrdersService: InboundOrdersService) {}

  @MessagePattern('createInboundOrder')
  create(@Payload() createInboundOrderDto: CreateInboundOrderDto) {
    return this.inboundOrdersService.create(createInboundOrderDto);
  }

  @MessagePattern('findAllInboundOrders')
  findAll() {
    return this.inboundOrdersService.findAll();
  }

  @MessagePattern('findOneInboundOrder')
  findOne(@Payload() id: number) {
    return this.inboundOrdersService.findOne(id);
  }

  // @MessagePattern('updateInboundOrder')
  // update(@Payload() updateInboundOrderDto: UpdateInboundOrderDto) {
  //   return this.inboundOrdersService.update(updateInboundOrderDto.id, updateInboundOrderDto);
  // }

  @MessagePattern('removeInboundOrder')
  remove(@Payload() id: number) {
    return this.inboundOrdersService.remove(id);
  }
}
