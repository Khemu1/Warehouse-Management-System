import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '@shared/dtos/products.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async createProduct(dto: CreateProductDto) {
    return await this.repo.save({
      name: dto.name,
      description: dto.description || '',
      sku: dto.sku,
      low_stock_threshold: dto.low_stock_threshold,
      unit_price: dto.unit_price,
    });
  }

  async updateProduct(dto: UpdateProductDto) {
    const doesExist = await this.repo.findOne({
      where: {
        id: dto.id,
      },
      select: {
        id: true,
      },
    });

    if (!doesExist) throw new NotFoundException('Product not found');

    await this.repo.update(
      {
        id: dto.id,
      },
      {
        name: dto.name,
        description: dto.description || '',
        sku: dto.sku,
        low_stock_threshold: dto.low_stock_threshold,
        unit_price: dto.unit_price,
      },
    );
  }

  async deleteProduct(id: string) {
    const doesExist = await this.repo.findOne({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!doesExist) throw new NotFoundException('Product not found');

    await this.repo.delete({
      id,
    });
  }

  async findOne(id: string) {
    const product = await this.repo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    const { updated_at, ...rest } = product;

    return rest;
  }

  async findWarehouseProducts(warehouse_id: string) {
    return await this.repo.find({
      where: { id: warehouse_id },
      select: {
        id: true,
        name: true,
        description: true,
        sku: true,
        unit_price: true,
        low_stock_threshold: true,
        created_at: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }
}
