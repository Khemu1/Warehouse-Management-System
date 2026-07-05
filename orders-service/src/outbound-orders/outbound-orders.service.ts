import { Injectable } from '@nestjs/common';
import { CreateOutboundOrderDto } from './dto/create-outbound-order.dto';
import { UpdateOutboundOrderDto } from './dto/update-outbound-order.dto';

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

  update(id: number, updateOutboundOrderDto: UpdateOutboundOrderDto) {
    return `This action updates a #${id} outboundOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} outboundOrder`;
  }
}
