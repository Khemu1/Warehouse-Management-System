import { Module } from '@nestjs/common';
import { OutboundOrdersController } from './outbound-orders.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OutboundOrdersController],
})
export class OutboundOrdersModule {}
