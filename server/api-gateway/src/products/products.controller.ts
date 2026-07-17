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
  Inject,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from '@shared/dtos/products.dto';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { Roles } from '@shared/types';
import type { JwtPayload, ISafeClient } from '@shared/types';
import { User } from '@shared/decorators/user.decorator';
import { RateLimit } from '@shared/decorators/rate-limit.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PaginatedProductsResponse,
  ProductResponse,
  ApiErrorResponse,
} from '@shared/dtos/responses.dto';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@RateLimit()
export class ProductsController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
  ) {}

  @Get()
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedProductsResponse })
  @ApiResponse({ status: 401, type: ApiErrorResponse })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
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
  @AllowedRoles(Roles.ADMIN)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created',
    type: ProductResponse,
  })
  @ApiResponse({ status: 400, type: ApiErrorResponse })
  createProduct(@Body() dto: CreateProductDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('createProduct', { ...dto, ...user });
  }

  @Put(':id')
  @AllowedRoles(Roles.ADMIN)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, type: ProductResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('updateProduct', { ...dto, id, ...user });
  }

  @Delete(':id')
  @HttpCode(204)
  @AllowedRoles(Roles.ADMIN)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('deleteProduct', { id, ...user });
  }

  @Get(':id')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, type: ProductResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  getProduct(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.inventoryClient.send('findOneProduct', { id, ...user });
  }

  @Get('warehouse/:id')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get products by warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({ status: 200, type: [ProductResponse] })
  getWarehouseProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findWarehouseProducts', { id, ...user });
  }
}
