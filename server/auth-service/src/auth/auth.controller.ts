import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { Serialize } from '@shared/interceptors/serialize.interceptors';
import { AuthDto, CreateAuthDto, LoginAuthDto } from '@shared/dtos/auth.dtos';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '@shared/types';

@Serialize(AuthDto)
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @MessagePattern('registerAuth')
  async create(@Payload() createAuthDto: CreateAuthDto) {
    const user = await this.authService.create(createAuthDto);
    const token = await this.jwtService.signAsync({
      user_id: user.id,
      role: user.role,
    });
    return {
      ...user,
      token,
    };
  }

  @MessagePattern('loginAuth')
  async loginUser(@Payload() loginAuthDto: LoginAuthDto) {
    const user = await this.authService.login(loginAuthDto);
    const token = await this.jwtService.signAsync({
      user_id: user.id,
      role: user.role,
    });
    return {
      ...user,
      token,
    };
  }

  @MessagePattern('doesUserWithRoleExist')
  async doesUserWithRoleExist(
    @Payload() doesUserWithRoleExistDto: { user_id: string; roles: Roles[] },
  ) {
    return this.authService.doesUserWithRoleExist(
      doesUserWithRoleExistDto.user_id,
      doesUserWithRoleExistDto.roles,
    );
  }

  @MessagePattern('findUsersByIds')
  async findUsersByIds(@Payload() ids: string[]) {
    return this.authService.findByIds(ids);
  }

  @MessagePattern('health.check')
  checkHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'inventory-service',
      timestamp: new Date().toISOString(),
    };
  }
}
