import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { BullModule } from '@nestjs/bullmq';
import { StockUpdatesProcessor } from './processors/stock-updates.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'stock-updates' })],
  controllers: [InventoryController],
  providers: [InventoryService, StockUpdatesProcessor],
})
export class InventoryModule {}
