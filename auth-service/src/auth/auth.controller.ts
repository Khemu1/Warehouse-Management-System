import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { Serialize } from '@shared/interceptors/serialize.interceptors';
import { AuthDto, CreateAuthDto, LoginAuthDto } from './dto/auth.dtos';
import { JwtService } from '@nestjs/jwt';

@Serialize(AuthDto)
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @MessagePattern('createAuth')
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
}
