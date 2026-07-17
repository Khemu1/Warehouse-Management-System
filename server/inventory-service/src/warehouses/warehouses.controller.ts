import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseMessageDto,
} from '@shared/dtos/warehouses.dtos';

@Controller()
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @MessagePattern('findAllWarehouses')
  async findAll(
    @Payload() data: { page: number; limit: number; search: string },
  ) {
    return this.warehousesService.findAll(data.page, data.limit, data.search);
  }

  @MessagePattern('findOneWarehouse')
  async findOne(@Payload() data: { id: string }) {
    return this.warehousesService.findOne(data.id);
  }

  @MessagePattern('createWarehouse')
  async create(@Payload() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @MessagePattern('updateWarehouse')
  async update(@Payload() dto: UpdateWarehouseMessageDto) {
    await this.warehousesService.update(dto);
    return {};
  }

  @MessagePattern('deleteWarehouse')
  async remove(@Payload() data: { id: string }) {
    await this.warehousesService.remove(data.id);
    return {};
  }

  @MessagePattern('doesWarehouseExist')
  async doesExist(@Payload() data: { id: string }) {
    return this.warehousesService.doesWarehouseExist(data.id);
  }

}
