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
  PaginatedOutboundOrdersResponse,
  OutboundOrderResponse,
  ApiErrorResponse,
} from '@shared/dtos/responses.dto';

@ApiTags('Outbound Orders')
@ApiBearerAuth('JWT-auth')
@Controller('outbound-orders')
@RateLimit()
export class OutboundOrdersController {
  constructor(@Inject('ORDERS_SERVICE') private ordersClient: ISafeClient) {}

  @Get()
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get all outbound orders (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'warehouse_id', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedOutboundOrdersResponse })
  @ApiResponse({ status: 401, type: ApiErrorResponse })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
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

  @Post()
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Create an outbound order' })
  @ApiBody({ type: CreateOutboundOrderDto })
  @ApiResponse({ status: 201, type: OutboundOrderResponse })
  @ApiResponse({ status: 400, type: ApiErrorResponse })
  create(@Body() dto: CreateOutboundOrderDto, @User() user: JwtPayload) {
    return this.ordersClient.send('createOutboundOrder', { ...dto, ...user });
  }

  @Patch(':id/confirm')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Confirm an outbound order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, type: OutboundOrderResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  confirm(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('confirmOutboundOrder', { id, ...user });
  }

  @Post(':id/cancel')
  @HttpCode(204)
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Cancel an outbound order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 204, description: 'Cancelled' })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  cancel(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('cancelOutboundOrder', { id, ...user });
  }

  @Get(':id')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get outbound order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, type: OutboundOrderResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('findOneOutboundOrder', {
      id,
      enrich: true,
      ...user,
    });
  }
  @Post(':id/retry')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Retry a needs_attention outbound order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  retry(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('retryOutboundOrder', { id, ...user });
  }
}
