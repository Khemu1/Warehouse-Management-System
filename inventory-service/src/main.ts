
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    name: 'INVENTORY_SERVICE',
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'inventory_queue',
    },
  });
  await app.listen();
}
bootstrap();
