import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProd = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';

    return isProd
      ? {
          type: 'postgres',
          url: this.configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: false,
        }
      : {
          type: 'postgres',
          url: this.configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: isTest,
        };
  }
}
