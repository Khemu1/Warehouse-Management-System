import { SafeClientProxy } from '@shared/safe-client-proxy';
import { Module } from '@nestjs/common';
import { ClientsModule, ClientProxy, Transport } from '@nestjs/microservices';

const RAW_INVENTORY = 'INVENTORY_SERVICE_RAW';
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
    ]),
  ],
  providers: [
    {
      provide: 'INVENTORY_SERVICE',
      useFactory: (client: ClientProxy) => new SafeClientProxy(client),
      inject: [RAW_INVENTORY],
    },
  ],
  exports: ['INVENTORY_SERVICE'],
})
export class AppClientsModule {}
