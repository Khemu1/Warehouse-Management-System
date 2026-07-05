import { Injectable } from '@nestjs/common';
import {
  CreateOutboundOrderDto,
  UpdateOutboundOrderDto,
} from '@shared/dtos/outbound-order.dtos';

@Injectable()
export class OutboundOrdersService {
  create(createOutboundOrderDto: CreateOutboundOrderDto) {
    return 'This action adds a new outboundOrder';
  }

  findAll() {
    return `This action returns all outboundOrders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} outboundOrder`;
  }

  update(updateOutboundOrderDto: UpdateOutboundOrderDto) {
    return `This action updates a #${updateOutboundOrderDto} outboundOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} outboundOrder`;
  }
}
