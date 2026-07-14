import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseUUIDPipe,
  Inject,
  HttpCode,
  Query,
  Patch,
} from '@nestjs/common';
import { CreateOutboundOrderDto } from '@shared/dtos/outbound-order.dtos';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { Roles } from '@shared/types';
import type { JwtPayload, ISafeClient } from '@shared/types';
import { User } from '@shared/decorators/user.decorator';

@Controller('outbound-orders')
export class OutboundOrdersController {
  constructor(@Inject('ORDERS_SERVICE') private ordersClient: ISafeClient) {}

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Post()
  create(@Body() dto: CreateOutboundOrderDto, @User() user: JwtPayload) {
    console.log('CreateOutboundOrderDto');
    return this.ordersClient.send('createOutboundOrder', { ...dto, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @HttpCode(204)
  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('cancelOutboundOrder', { id, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('findOneOutboundOrder', { id, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Patch(':id/confirm')
  confirm(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('confirmOutboundOrder', { id, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get()
  findAll(
    @Query('warehouse_id', new ParseUUIDPipe({ optional: true }))
    warehouse_id: string | undefined,
    @User() user: JwtPayload,
  ) {
    return this.ordersClient.send('findAllOutboundOrders', {
      warehouse_id,
      ...user,
    });
  }
}
