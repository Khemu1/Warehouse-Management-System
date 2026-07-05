import { Module } from '@nestjs/common';
import { InboundOrdersController } from './inbound-orders.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InboundOrdersController],
})
export class InboundOrdersModule {}
