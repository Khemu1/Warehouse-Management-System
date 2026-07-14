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
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  UpdateWarehouseMessageDto,
} from '@shared/dtos/warehouses.dtos';
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

@ApiTags('Warehouses')
@ApiBearerAuth('JWT-auth')
@Controller('warehouses')
export class WarehousesController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
  ) {}

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get()
  @ApiOperation({ summary: 'Get all warehouses (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findAllWarehouses', {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      ...user,
    });
  }

  @AllowedRoles(Roles.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiBody({ type: CreateWarehouseDto })
  @ApiResponse({ status: 201, description: 'Warehouse created' })
  createWarehouse(@Body() dto: CreateWarehouseDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('createWarehouse', { ...dto, ...user });
  }

  @AllowedRoles(Roles.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiBody({ type: UpdateWarehouseDto })
  updateWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
    @User() user: JwtPayload,
  ) {
    const message: UpdateWarehouseMessageDto = { id, ...dto };
    return this.inventoryClient.send('updateWarehouse', {
      ...message,
      ...user,
    });
  }

  @AllowedRoles(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  deleteWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('deleteWarehouse', { id, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  getWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findOneWarehouse', { id, ...user });
  }
}
