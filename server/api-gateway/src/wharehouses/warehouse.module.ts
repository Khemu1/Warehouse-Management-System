import { Module } from '@nestjs/common';
import { WarehousesController } from './warehouse.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WarehousesController],
})
export class WarehousesModule {}
