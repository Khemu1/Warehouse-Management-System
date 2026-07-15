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
import { RateLimit } from '@/decorator/rate-limit.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject('PAYMENTS_SERVICE') private paymentsClient: ISafeClient,
  ) {}

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Post()
  @RateLimit({ points: 5, duration: 60 })
  create(@Body() data: CreatePaymentDto) {
    return this.paymentsClient.send('createPayment', data);
  }
  @Get(':id')
  @RateLimit()
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.paymentsClient.send('findOnePayment', {
      id,
      ...user,
    });
  }

  @Get('order/:orderId')
  getPaymentForOrder(@Param('orderId') orderId: string) {
    return this.paymentsClient.send('findPaymentForOrder', { id: orderId });
  }
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
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
}
