import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from '@shared/dtos/products.dto';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { Roles } from '@shared/types';
import type { JwtPayload } from '@shared/types';
import { User } from '@shared/decorators/user.decorator';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ClientProxy,
  ) {}

  @AllowedRoles(Roles.ADMIN)
  @Post('')
  createProduct(@Body() dto: CreateProductDto, @User() user: JwtPayload) {
    console.log('now calling createProduct');
    return this.inventoryClient.send('createProduct', { ...dto, ...user });
  }

  @AllowedRoles(Roles.ADMIN)
  @Put(':id')
  @HttpCode(204)
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductDto,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('updateProduct', {
      id,
      ...dto,
      ...user,
    });
  }

  @AllowedRoles(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('deleteProduct', {
      id,
      ...user,
    });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get(':id')
  getProduct(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    console.log('find one product');
    return this.inventoryClient.send('findOneProduct', {
      id: id,
      ...user,
    });
  }
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get(':id')
  getWharehoueProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findWharehouseProducts', {
      id: id,
      ...user,
    });
  }
}
