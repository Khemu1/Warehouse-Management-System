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
import { CreateProductDto } from '@shared/dtos/products.dto';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { Roles } from '@shared/types';
import type { JwtPayload, ISafeClient } from '@shared/types';
import { User } from '@shared/decorators/user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
  ) {}

  @AllowedRoles(Roles.ADMIN)
  @Post('')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    // Use any or create a simple response type
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        // Add other product properties
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createProduct(@Body() dto: CreateProductDto, @User() user: JwtPayload) {
    console.log('now calling createProduct');
    return this.inventoryClient.send('createProduct', { ...dto, ...user });
  }

  @AllowedRoles(Roles.ADMIN)
  @Put(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 204, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
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
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
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
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        sku: { type: 'string' },
        price: { type: 'number' },
        // Add other product properties
      },
    },
  })
  getProduct(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.inventoryClient.send('findOneProduct', {
      id: id,
      ...user,
    });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get('warehouse/:id') // Fixed: Changed from duplicate ':id' to 'warehouse/:id'
  @ApiOperation({ summary: 'Get warehouse products' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of warehouse products',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          quantity: { type: 'number' },
          warehouse_id: { type: 'string', format: 'uuid' },
        },
      },
    },
  })
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
