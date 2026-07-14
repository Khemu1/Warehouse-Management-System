import { SafeClientProxy } from '@shared/safe-client-proxy';
import { Global, Module } from '@nestjs/common';
import { ClientsModule, ClientProxy, Transport } from '@nestjs/microservices';

const RAW_INVENTORY = 'INVENTORY_SERVICE_RAW';
const RAW_ORDERS = 'ORDERS_SERVICE_RAW';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: RAW_INVENTORY,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'inventory_queue',
        },
      },
      {
        name: RAW_ORDERS,
        transport: Transport.RMQ,
        options: { urls: [process.env.RABBITMQ_URL!], queue: 'orders_queue' },
      },
    ]),
  ],
  providers: [
    {
      provide: 'INVENTORY_SERVICE',
      useFactory: (client: ClientProxy) => new SafeClientProxy(client),
      inject: [RAW_INVENTORY],
    },
    {
      provide: 'ORDERS_SERVICE',
      useFactory: (client: ClientProxy) => new SafeClientProxy(client),
      inject: [RAW_ORDERS],
    },
  ],
  exports: ['INVENTORY_SERVICE', 'ORDERS_SERVICE'],
})
export class AppClientsModule {}
