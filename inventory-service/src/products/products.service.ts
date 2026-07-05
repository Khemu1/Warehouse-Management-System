import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { In, Repository } from 'typeorm';
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

  async doesProductsExist(ids: string[]) {
    const found = await this.repo.find({
      where: { id: In(ids) },
      select: { id: true },
    });

    const foundIds = new Set(found.map((p) => p.id));
    const missingIds = ids.filter((id) => !foundIds.has(id));

    return {
      allExist: missingIds.length === 0,
      missingIds,
    };
  }
}
