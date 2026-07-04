import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateProductDto, UpdateProductDto } from '@shared/dtos/products.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('createProduct')
  async createProduct(dto: CreateProductDto) {
    console.log("MessagePattern('createProduct')");
    return await this.productsService.createProduct(dto);
  }
  @MessagePattern('updateProduct')
  async updateProduct(dto: UpdateProductDto) {
    await this.productsService.updateProduct(dto);
    return {};
  }
  @MessagePattern('findOneProduct')
  async getProduct(data: { id: string }) {
    return await this.productsService.findOne(data.id);
  }
  @MessagePattern('findWharehouseProducts')
  async getwarehouseProducts(data: { id: string }) {
    return await this.productsService.findWarehouseProducts(data.id);
  }

  @MessagePattern('deleteProduct')
  async deleteProduct(data: { id: string }) {
    await this.productsService.deleteProduct(data.id);
    return {};
  }
}
