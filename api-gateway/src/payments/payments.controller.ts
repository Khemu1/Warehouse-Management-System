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

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject('PAYMENTS_SERVICE') private paymentsClient: ISafeClient,
  ) {}

  @AllowedRoles(Roles.ADMIN, Roles.STAFF)
  @Post()
  create(@Body() data: CreatePaymentDto) {
    return this.paymentsClient.send('createPayment', data);
  }
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: JwtPayload) {
    return this.paymentsClient.send('findOnePayment', {
      id,
      ...user,
    });
  }
  @Get('')
  findAll(@Query() id: string, @User() user: JwtPayload) {
    return this.paymentsClient.send('findAllPayments', {
      id,
      ...user,
    });
  }
}
