import { Module } from '@nestjs/common';
import { InboundOrdersService } from './inbound-orders.service';
import { InboundOrdersController } from './inbound-orders.controller';
import { ReceiveOrderProcessor } from '@/processors/inbound-order-processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'order-processing' },
      { name: 'stock-updates' },
    ),
  ],
  controllers: [InboundOrdersController],
  providers: [InboundOrdersService, ReceiveOrderProcessor],
})
export class InboundOrdersModule {}
