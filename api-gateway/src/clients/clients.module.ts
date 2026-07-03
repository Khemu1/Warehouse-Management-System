import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
// by adding the global decorator, we can make this module available globally once it's loaded somewhere,
// thus making it visible to all modules
@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'inventory_queue',
        },
      },
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: { urls: [process.env.RABBITMQ_URL!], queue: 'orders_queue' },
      },

      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: { urls: [process.env.RABBITMQ_URL!], queue: 'auth_queue' },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class AppClientsModule {}
