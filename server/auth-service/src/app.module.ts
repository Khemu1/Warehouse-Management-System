import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@shared/config/db/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { GlobalErrorFilter } from '@shared/filters/global-error.filter';
import { CustomError } from '@shared/filters/CustomError';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (validationErrors) => {
          const flattenedErrors: Record<string, string> = {};

          const formatErrors = (errors: any[], parentKey = '') => {
            for (const err of errors) {
              const key = parentKey
                ? `${parentKey}.${err.property}`
                : err.property;
              if (err.constraints) {
                const msgs = Object.values(err.constraints);
                flattenedErrors[key] = msgs[msgs.length - 1] as string;
              }
              if (err.children?.length) {
                formatErrors(err.children, key);
              }
            }
          };

          formatErrors(validationErrors);

          return new CustomError(
            'Validation failed',
            422,
            'validation error',
            true,
            'Please fix the highlighted fields',
            flattenedErrors,
          );
        },
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalErrorFilter,
    },
  ],
})
export class AppModule {}
