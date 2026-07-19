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
  PaginatedInboundOrdersResponse,
  InboundOrderResponse,
  ApiErrorResponse,
} from '@shared/dtos/responses.dto';

@ApiTags('Inbound Orders')
@ApiBearerAuth('JWT-auth')
@Controller('inbound-orders')
@RateLimit()
export class InboundOrdersController {
  constructor(@Inject('ORDERS_SERVICE') private ordersClient: ISafeClient) {}

  @Get()
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get all inbound orders (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'warehouse_id', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedInboundOrdersResponse })
  @ApiResponse({ status: 401, type: ApiErrorResponse })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
    @User() user: JwtPayload,
    @Query('warehouse_id') warehouse_id?: string,
  ) {
    return this.ordersClient.send('findAllInboundOrders', {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      warehouse_id: warehouse_id || undefined,
      ...user,
    });
  }

  @Post()
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Create an inbound order' })
  @ApiBody({ type: CreateInboundOrderDto })
  @ApiResponse({ status: 201, type: InboundOrderResponse })
  @ApiResponse({ status: 400, type: ApiErrorResponse })
  create(@Body() dto: CreateInboundOrderDto, @User() user: JwtPayload) {
    return this.ordersClient.send('createInboundOrder', { ...dto, ...user });
  }

  @Post(':id/receive')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Receive an inbound order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiBody({ type: ReceiveInboundOrderDto })
  @ApiResponse({ status: 200, description: 'Order queued for receiving' })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  receive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceiveInboundOrderDto,
    @User() user: JwtPayload,
  ) {
    return this.ordersClient.send('receiveInboundOrder', {
      ...dto,
      order_id: id,
      ...user,
    });
  }

  @Post(':id/cancel')
  @HttpCode(204)
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Cancel an inbound order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 204, description: 'Cancelled' })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  cancel(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('cancelInboundOrder', { id, ...user });
  }

  @Get(':id')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get inbound order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, type: InboundOrderResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('findOneInboundOrder', { id, ...user });
  }

  @Post(':id/retry')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Retry a needs_attention inbound order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  retry(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.ordersClient.send('retryInboundOrder', { id, ...user });
  }
}
