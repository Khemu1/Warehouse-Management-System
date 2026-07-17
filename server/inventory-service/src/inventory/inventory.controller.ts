import { Controller } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
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

  @MessagePattern('findAllInventory')
  async findAll(
    @Payload()
    data: {
      page: number;
      limit: number;
      search: string;
      warehouse_id?: string;
    },
  ) {
    return this.inventoryService.findAll(
      data.page,
      data.limit,
      data.search,
      data.warehouse_id,
    );
  }

  @MessagePattern('getDashboardStats')
  async getDashboardStats() {
    return this.inventoryService.getDashboardStats();
  }

  @MessagePattern('didItemMove')
  async didItemMove(@Payload() data: { idempotency_key: string }) {
    return this.inventoryService.didItemMove(data.idempotency_key);
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
