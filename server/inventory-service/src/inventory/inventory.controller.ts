import { Controller } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MessagePattern } from '@nestjs/microservices';
import { CheckStockDto, ReserveStockDto } from '@shared/dtos/inventory.dtos';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  @MessagePattern('checkStock')
  async checkInventory(data: CheckStockDto) {
    return await this.inventoryService.check(data);
  }
  @MessagePattern('reserveInventoryItems')
  async reserve(data: ReserveStockDto) {
    return await this.inventoryService.reserve(data);
  }
  @MessagePattern('findWarehouseProducts')
  async getwarehouseProducts(data: { id: string }) {
    return await this.inventoryService.findWarehouseProducts(data.id);
  }

  @MessagePattern('health.check')
  checkHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'inventory-service',
      timestamp: new Date().toISOString(),
    };
  }
}
