import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Query,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from '@shared/dtos/products.dto';
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
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@AllowedRoles(Roles.ADMIN, Roles.STAFF)
export class ProductsController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated products list' })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findAllProducts', {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      ...user,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createProduct(@Body() dto: CreateProductDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('createProduct', { ...dto, ...user });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('updateProduct', {
      ...dto,
      id,
      ...user,
    });
  }

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
    return this.inventoryClient.send('deleteProduct', { id, ...user });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProduct(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.inventoryClient.send('findOneProduct', { id, ...user });
  }

  @Get('warehouse/:id')
  @ApiOperation({ summary: 'Get products by warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({ status: 200, description: 'Warehouse products list' })
  getWarehouseProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findWarehouseProducts', {
      id,
      ...user,
    });
  }
}
