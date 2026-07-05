import { Injectable } from '@nestjs/common';
import {
  CreateInboundOrderDto,
  UpdateInboundOrderDto,
} from '@shared/dtos/inbound-order.dtos';

@Injectable()
export class InboundOrdersService {
  create(createInboundOrderDto: CreateInboundOrderDto) {
    return 'This action adds a new inboundOrder';
  }

  findAll() {
    return `This action returns all inboundOrders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inboundOrder`;
  }

  update(id: number, updateInboundOrderDto: UpdateInboundOrderDto) {
    return `This action updates a #${id} inboundOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} inboundOrder`;
  }
}
