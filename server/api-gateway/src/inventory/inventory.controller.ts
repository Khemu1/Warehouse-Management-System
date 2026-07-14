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
// Add Swagger decorators
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Inventory') // Groups all endpoints under "Inventory" in Swagger
@ApiBearerAuth('JWT-auth') // All endpoints need JWT auth
@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
  ) {}

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get('warehouse/:id')
  @ApiOperation({
    summary: 'Get warehouse products',
    description: 'Retrieves all products in a specific warehouse',
  })
  @ApiParam({
    name: 'id',
    description: 'Warehouse UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns warehouse products',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
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

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Post('check')
  @ApiOperation({
    summary: 'Check stock availability',
    description: 'Check if items are available in inventory',
  })
  @ApiBody({
    type: CheckStockDto,
    description: 'Stock check parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns stock availability information',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
  })
  checkStock(@Body() dto: CheckStockDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('checkInventoryItem', { ...dto, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get()
  @ApiOperation({ summary: 'Get all inventory items (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'warehouse_id', required: false, type: String })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
    @Query('warehouse_id') warehouse_id: string = '',
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
}
