import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProductDto, UpdateProductDto } from '@shared/dtos/products.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('createProduct')
  async createProduct(@Payload() dto: CreateProductDto) {
    return await this.productsService.createProduct(dto);
  }
  @MessagePattern('updateProduct')
  async updateProduct(@Payload() dto: UpdateProductDto) {
    await this.productsService.updateProduct(dto);
    return {};
  }
  @MessagePattern('findOneProduct')
  async getProduct(@Payload() data: { id: string }) {
    return await this.productsService.findOne(data.id);
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
}
