import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ReserveStockDto, CheckStockDto } from '@shared/dtos/inventory.dtos';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { Roles } from '@shared/types';
import type { JwtPayload } from '@shared/types';
import { User } from '@shared/decorators/user.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ClientProxy,
  ) {}

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get('warehouse/:id')
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
  checkStock(@Body() dto: CheckStockDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('checkInventoryItem', { ...dto, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Post('reserve')
  reserveStock(@Body() dto: ReserveStockDto, @User() user: JwtPayload) {
    return this.inventoryClient.send('reserveInventoryItems', {
      ...dto,
      ...user,
    });
  }
}
