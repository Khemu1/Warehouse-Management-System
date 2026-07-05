import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    name: 'ORDERS_SERVICE',
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'orders_queue',
    },
  });
  await app.listen();
}
bootstrap();
