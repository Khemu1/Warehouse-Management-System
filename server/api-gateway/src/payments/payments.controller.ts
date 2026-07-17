import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { type JwtPayload, Roles, type ISafeClient } from '@shared/types';
import { CreatePaymentDto } from '@shared/dtos/payment.dto';
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
  PaginatedPaymentsResponse,
  PaymentResponse,
  ApiErrorResponse,
} from '@shared/dtos/responses.dto';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
@RateLimit()
export class PaymentsController {
  constructor(
    @Inject('PAYMENTS_SERVICE') private paymentsClient: ISafeClient,
  ) {}

  @Get()
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get all payments (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedPaymentsResponse })
  @ApiResponse({ status: 401, type: ApiErrorResponse })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @User() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    return this.paymentsClient.send('findAllPayments', {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      ...user,
    });
  }

  @Post()
  @RateLimit({
    methods: {
      POST: { duration: 60, points: 10 },
    },
  })
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @RateLimit({ points: 5, duration: 60 })
  @ApiOperation({ summary: 'Create a payment' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, type: PaymentResponse })
  @ApiResponse({ status: 400, type: ApiErrorResponse })
  @ApiResponse({
    status: 409,
    description: 'Payment already exists',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    type: ApiErrorResponse,
  })
  create(@Body() data: CreatePaymentDto) {
    return this.paymentsClient.send('createPayment', data);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment by order ID (public)' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({ status: 200, type: PaymentResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  getPaymentForOrder(@Param('orderId') orderId: string) {
    return this.paymentsClient.send('findPaymentForOrder', { id: orderId });
  }

  @Get(':id')
  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, type: PaymentResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.paymentsClient.send('findOnePayment', { id, ...user });
  }
}
