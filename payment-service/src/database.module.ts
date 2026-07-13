import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment/entities/payment.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    TypeOrmModule.forFeature([Payment]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
