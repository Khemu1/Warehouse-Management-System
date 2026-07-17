import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateWarehouseDto,
  UpdateWarehouseMessageDto,
} from '@shared/dtos/warehouses.dtos';
import { Warehouse } from './warehouse.entity';
import { Repository, ILike } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse) private repo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateWarehouseDto) {
    return this.repo.save({
      name: dto.name,
      location: dto.location,
      capacity: dto.capacity,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<Pagination<Warehouse>> {
    const queryBuilder = this.repo.createQueryBuilder('warehouse');

    if (search) {
      queryBuilder.where(
        'warehouse.name ILIKE :search OR warehouse.location ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .select([
        'warehouse.id',
        'warehouse.name',
        'warehouse.location',
        'warehouse.capacity',
      ])
      .orderBy('warehouse.created_at', 'DESC');

    return paginate<Warehouse>(queryBuilder, { page, limit });
  }

  async findOne(id: string) {
    const warehouse = await this.repo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        created_at: true,
      },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async update(dto: UpdateWarehouseMessageDto) {
    const exists = await this.repo.findOneBy({ id: dto.id });
    if (!exists) throw new NotFoundException('Warehouse not found');

    await this.repo.update(
      { id: dto.id },
      {
        name: dto.name,
        location: dto.location,
        capacity: dto.capacity,
      },
    );
  }

  async remove(id: string) {
    const exists = await this.repo.findOneBy({ id });
    if (!exists) throw new NotFoundException('Warehouse not found');
    await this.repo.delete({ id });
  }

  async doesWarehouseExist(id: string): Promise<boolean> {
    const warehouse = await this.repo.findOne({
      where: { id },
      select: { id: true, capacity: true },
    });
    return !!warehouse;
  }
}
