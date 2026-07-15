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

@AllowedRoles(Roles.ADMIN, Roles.STAFF)
@Controller('outbound-orders')
export class OutboundOrdersController {
  constructor(@Inject('ORDERS_SERVICE') private ordersClient: ISafeClient) {}

  @Post()
  create(@Body() dto: CreateOutboundOrderDto, @User() user: JwtPayload) {
    console.log('CreateOutboundOrderDto');
    return this.ordersClient.send('createOutboundOrder', { ...dto, ...user });
  }

  @HttpCode(204)
  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('cancelOutboundOrder', { id, ...user });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('findOneOutboundOrder', {
      id,
      enrich: true,
      ...user,
    });
  }

  @Patch(':id/confirm')
  confirm(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('confirmOutboundOrder', { id, ...user });
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
    @User() user: JwtPayload,
    @Query('warehouse_id') warehouse_id?: string,
  ) {
    return this.ordersClient.send('findAllOutboundOrders', {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      warehouse_id: warehouse_id || undefined,
      ...user,
    });
  }
}
