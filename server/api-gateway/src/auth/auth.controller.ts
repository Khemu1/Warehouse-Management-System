// api-gateway/src/auth/auth.controller.ts
import { RateLimit } from '@/decorator/rate-limit.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from '@shared/dtos/auth.dtos';
import type { ISafeClient } from '@shared/types';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authClient: ISafeClient) {}

  @Post('register')
  register(@Body() dto: CreateAuthDto) {
    return this.authClient.send('registerAuth', dto);
  }

  @Post('login')
  @RateLimit({
    methods: {
      POST: {
        points: 5,
        duration: 60,
      },
    },
    message: 'Too Many login requests',
  })
  login(@Body() dto: LoginAuthDto) {
    return this.authClient.send('loginAuth', dto);
  }
}
