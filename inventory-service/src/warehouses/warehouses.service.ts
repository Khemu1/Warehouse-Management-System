import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateWarehouseDto,
  UpdateWharehouseDto,
} from '@shared/dtos/warehouses.dtos';
import { Warehouse } from './warehouse.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse) private repo: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    return await this.repo.save({
      user_id: createWarehouseDto.user_id,
      name: createWarehouseDto.name,
      location: createWarehouseDto.location,
      capacity: createWarehouseDto.capacity,
    });
  }

  async findAll() {
    // todo: add pagination later
    return await this.repo.find({
      order: { created_at: 'DESC' },
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
      },
    });
  }

  async findOne(id: string) {
    const doesExist = await this.repo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        created_at: true,
      },
    });
    if (!doesExist) throw new NotFoundException("This warehouse doesn't exist");
    return doesExist;
  }

  async update(updateWarehouseDto: UpdateWharehouseDto) {
    const doesExist = await this.repo.findOneBy({ id: updateWarehouseDto.id });
    if (!doesExist) throw new NotFoundException("This warehouse doesn't exist");

    return await this.repo.update(
      {
        id: updateWarehouseDto.id,
      },
      {
        capacity: updateWarehouseDto.capacity,
        name: updateWarehouseDto.name,
        location: updateWarehouseDto.location,
      },
    );
  }

  async remove(id: string) {
    const doesExist = await this.repo.findOneBy({ id });
    if (!doesExist) throw new NotFoundException("This warehouse doesn't exist");

    return await this.repo.delete({ id });
  }

  async doesWarehouseExist(id: string) {
    const warehouse = await this.repo.findOne({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
    if (!warehouse) return false;
    return true;
  }
}
