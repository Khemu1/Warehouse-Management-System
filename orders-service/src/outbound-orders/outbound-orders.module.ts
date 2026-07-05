import { Module } from '@nestjs/common';
import { OutboundOrdersService } from './outbound-orders.service';
import { OutboundOrdersController } from './outbound-orders.controller';

@Module({
  controllers: [OutboundOrdersController],
  providers: [OutboundOrdersService],
})
export class OutboundOrdersModule {}
