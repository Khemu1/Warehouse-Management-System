import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWharehouseDto,
} from '@shared/dtos/warehouses.dtos';
@Controller()
export class WarehousesController {
  constructor(private readonly WarehousesService: WarehousesService) {}

  @MessagePattern('createWarehouse')
  async create(@Payload() createWarehouseDto: CreateWarehouseDto) {
    return await this.WarehousesService.create(createWarehouseDto);
  }

  @MessagePattern('findAllWarehouses')
  async findAll() {
    return this.WarehousesService.findAll();
  }

  @MessagePattern('findOneWarehouse')
  async findOne(@Payload() data: { id: string }) {
    return this.WarehousesService.findOne(data.id);
  }

  @MessagePattern('updateWarehouse')
  async update(@Payload() updateEventDto: UpdateWharehouseDto) {
    this.WarehousesService.update(updateEventDto);
    return {};
  }

  @MessagePattern('deleteWarehouse')
  async remove(@Payload() data: { id: string }) {
    await this.WarehousesService.remove(data.id);
    return {};
  }

  @MessagePattern('doesWarehouseExist')
  async doesExist(@Payload() data: { id: string }) {
    return await this.WarehousesService.doesWarehouseExist(data.id);
  }
}
