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
import { CreateWarehouseDto } from '@shared/dtos/warehouses.dtos';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { Roles } from '@shared/types';
import type { JwtPayload } from '@shared/types';
import { User } from '@shared/decorators/user.decorator';
import type { ISafeClient } from '@shared/types';

@Controller('warehouses')
export class WarehousesController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
  ) {}

  @AllowedRoles(Roles.ADMIN)
  @Post('')
  createWarehouse(@Body() dto: CreateWarehouseDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('createWarehouse', { ...dto, ...user });
  }

  @AllowedRoles(Roles.ADMIN)
  @Put(':id')
  @HttpCode(204)
  updateWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateWarehouseDto,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('updateWarehouse', {
      id,
      ...dto,
      ...user,
    });
  }

  @AllowedRoles(Roles.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  deleteWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('deleteWarehouse', {
      id,
      ...user,
    });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get('')
  getAllWarehouses(@User() user: JwtPayload) {
    return this.inventoryClient.send('findAllWarehouses', { ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get(':id')
  getWarehouse(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: JwtPayload,
  ) {
    return this.inventoryClient.send('findOneWarehouse', {
      id: id,
      ...user,
    });
  }
}
