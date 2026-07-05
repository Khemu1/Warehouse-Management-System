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
} from '@nestjs/common';
import {
  CreateInboundOrderDto,
  ReceiveInboundOrderDto,
} from '@shared/dtos/inbound-order.dtos';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { Roles } from '@shared/types';
import type { JwtPayload, ISafeClient } from '@shared/types';
import { User } from '@shared/decorators/user.decorator';

@Controller('inbound-orders')
export class InboundOrdersController {
  constructor(@Inject('ORDERS_SERVICE') private ordersClient: ISafeClient) {}

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Post()
  create(@Body() dto: CreateInboundOrderDto, @User() user: JwtPayload) {
    return this.ordersClient.send('createInboundOrder', { ...dto, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Post(':id/receive')
  receive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceiveInboundOrderDto,
    @User() user: JwtPayload,
  ) {
    return this.ordersClient.send('receiveInboundOrder', {
      ...dto,
      ...user,
      id,
    });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @HttpCode(204)
  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('cancelInboundOrder', { id, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('findOneInboundOrder', { id, ...user });
  }

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Get()
  findAll(
    @Query('warehouse_id', new ParseUUIDPipe({ optional: true }))
    warehouse_id: string | undefined,
    @User() user: JwtPayload,
  ) {
    return this.ordersClient.send('findAllInboundOrders', {
      warehouse_id,
      ...user,
    });
  }
}
