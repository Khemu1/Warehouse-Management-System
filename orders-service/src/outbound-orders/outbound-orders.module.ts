import { Module } from '@nestjs/common';
import { OutboundOrdersService } from './outbound-orders.service';
import { OutboundOrdersController } from './outbound-orders.controller';
import { BullModule } from '@nestjs/bullmq';
import { OutboundOrdersProcessor } from '@/processors/outbound-order-processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'outbound-order-processing' },
      { name: 'stock-updates' },
    ),
  ],
  controllers: [OutboundOrdersController],
  providers: [OutboundOrdersService, OutboundOrdersProcessor],
})
export class OutboundOrdersModule {}
