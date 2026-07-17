import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseUUIDPipe,
  Inject,
  Query,
} from '@nestjs/common';
import { CheckStockDto } from '@shared/dtos/inventory.dtos';
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
  PaginatedInventoryResponse,
  InventoryItemResponse,
  ApiErrorResponse,
} from '@shared/dtos/responses.dto';

@ApiTags('Inventory')
@ApiBearerAuth('JWT-auth')
@Controller('inventory')
@RateLimit()
export class InventoryController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
  ) {}

  @Get()
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get all inventory items (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'warehouse_id', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated inventory list',
    type: PaginatedInventoryResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ApiErrorResponse,
  })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @Query('warehouse_id') warehouse_id = '',
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findAllInventory', {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      warehouse_id: warehouse_id || undefined,
      ...user,
    });
  }

  @Get('warehouse/:id')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get warehouse products' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse products',
    type: [InventoryItemResponse],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    type: ApiErrorResponse,
  })
  getWarehouseProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findWarehouseProducts', {
      warehouse_id: id,
      ...user,
    });
  }

  @Post('check')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @RateLimit({ points: 10, duration: 60 })
  @ApiOperation({ summary: 'Check stock availability' })
  @ApiBody({ type: CheckStockDto })
  @ApiResponse({
    status: 200,
    description: 'Stock availability',
    type: [InventoryItemResponse],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    type: ApiErrorResponse,
  })
  checkStock(@Body() dto: CheckStockDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('checkStock', { ...dto, ...user });
  }
}
