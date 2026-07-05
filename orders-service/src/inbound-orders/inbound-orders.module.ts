import { Module } from '@nestjs/common';
import { InboundOrdersService } from './inbound-orders.service';
import { InboundOrdersController } from './inbound-orders.controller';

@Module({
  controllers: [InboundOrdersController],
  providers: [InboundOrdersService],
})
export class InboundOrdersModule {}
