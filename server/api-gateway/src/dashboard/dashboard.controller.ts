/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Inject } from '@nestjs/common';
import { type ISafeClient, type JwtPayload, Roles } from '@shared/types';
import { User } from '@shared/decorators/user.decorator';
import { AllowedRoles } from '@shared/decorators/roles.decorator';

@Controller('dashboard')
@AllowedRoles(Roles.ADMIN, Roles.STAFF)
export class DashboardController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
    @Inject('ORDERS_SERVICE') private ordersClient: ISafeClient,
    @Inject('PAYMENTS_SERVICE') private paymentsClient: ISafeClient,
  ) {}

  @Get('stats')
  async getStats(@User() user: JwtPayload) {
    const [inventoryStats, orderStats, paymentStats] = await Promise.all([
      this.inventoryClient.send('getDashboardStats', { ...user }),
      this.ordersClient.send('getOrderStats', { ...user }),
      this.paymentsClient.send('getPaymentStats', { ...user }),
    ]);

    return {
      ...inventoryStats,
      ...orderStats,
      ...paymentStats,
    };
  }
  @Get('recent-orders')
  async getRecentOrders(@User() user: JwtPayload) {
    return this.ordersClient.send('getRecentOrders', { ...user });
  }
}
