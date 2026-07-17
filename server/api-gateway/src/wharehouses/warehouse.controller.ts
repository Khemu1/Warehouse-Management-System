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
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  UpdateWarehouseMessageDto,
} from '@shared/dtos/warehouses.dtos';
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
  PaginatedWarehousesResponse,
  WarehouseResponse,
  ApiErrorResponse,
} from '@shared/dtos/responses.dto';

@ApiTags('Warehouses')
@ApiBearerAuth('JWT-auth')
@Controller('warehouses')
@RateLimit()
export class WarehousesController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
  ) {}

  @Get()
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get all warehouses (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedWarehousesResponse })
  @ApiResponse({ status: 401, type: ApiErrorResponse })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findAllWarehouses', {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      ...user,
    });
  }

  @Post()
  @AllowedRoles(Roles.ADMIN)
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiBody({ type: CreateWarehouseDto })
  @ApiResponse({
    status: 201,
    description: 'Warehouse created',
    type: WarehouseResponse,
  })
  @ApiResponse({ status: 400, type: ApiErrorResponse })
  createWarehouse(@Body() dto: CreateWarehouseDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('createWarehouse', { ...dto, ...user });
  }

  @Put(':id')
  @AllowedRoles(Roles.ADMIN)
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiBody({ type: UpdateWarehouseDto })
  @ApiResponse({ status: 200, type: WarehouseResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
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

  @Delete(':id')
  @HttpCode(204)
  @AllowedRoles(Roles.ADMIN)
  @ApiOperation({ summary: 'Delete a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  deleteWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('deleteWarehouse', { id, ...user });
  }

  @Get(':id')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse UUID' })
  @ApiResponse({ status: 200, type: WarehouseResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  getWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findOneWarehouse', { id, ...user });
  }
}
