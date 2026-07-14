import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { AppLogger } from '@shared/logger/AppLogger';

AppLogger.init('payments-service');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    name: 'PAYMENTS_SERVICE',
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'payments_queue',
    },
  });
  await app.listen();
}
bootstrap();
