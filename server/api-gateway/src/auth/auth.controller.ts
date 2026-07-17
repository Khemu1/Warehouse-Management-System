import { RateLimit } from '@shared/decorators/rate-limit.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { LoginAuthDto } from '@shared/dtos/auth.dtos';
import type { ISafeClient } from '@shared/types';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginResponse, ApiErrorResponse } from '@shared/dtos/responses.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authClient: ISafeClient) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate and receive a JWT token',
  })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
    type: ApiErrorResponse,
  })
  @RateLimit({
    methods: {
      POST: {
        points: 15,
        duration: 120,
      },
    },
    message: 'Too Many login requests',
  })
  login(@Body() dto: LoginAuthDto) {
    return this.authClient.send('loginAuth', dto);
  }
}
