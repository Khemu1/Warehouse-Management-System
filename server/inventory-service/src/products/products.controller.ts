import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProductDto,
  UpdateProductMessageDto,
} from '@shared/dtos/products.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('createProduct')
  async createProduct(@Payload() dto: CreateProductDto) {
    return await this.productsService.createProduct(dto);
  }
  @MessagePattern('updateProduct')
  async updateProduct(@Payload() dto: UpdateProductMessageDto) {
    await this.productsService.updateProduct(dto);
    return {};
  }
  @MessagePattern('findOneProduct')
  async getProduct(@Payload() data: { id: string }) {
    return await this.productsService.findOne(data.id);
  }

  @MessagePattern('findProductsByIds')
  async findByIds(@Payload() ids: string[]) {
    return await this.productsService.findByIds(ids);
  }

  @MessagePattern('deleteProduct')
  async deleteProduct(@Payload() data: { id: string }) {
    await this.productsService.deleteProduct(data.id);
    return {};
  }
  @MessagePattern('doesProductsExist')
  async doesExist(@Payload() ids: string[]) {
    return await this.productsService.doesProductsExist(ids);
  }
  @MessagePattern('findAllProducts')
  async findAll(
    @Payload() data: { page: number; limit: number; search: string },
  ) {
    return await this.productsService.findAll(
      data.page,
      data.limit,
      data.search,
    );
  }
}
