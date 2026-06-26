import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '@shared/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateAuthDto, LoginAuthDto } from './dto/auth.dtos';
import { comparePassword, hashPassword } from './auth.helpers';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(Users) private repo: Repository<Users>) {}

  async create(createAuthDto: CreateAuthDto) {
    const hashedPassword = await hashPassword(createAuthDto.password);
    createAuthDto.password = hashedPassword;
    const createdUser = this.repo.save(createAuthDto, {
      transaction: true,
    });
    return {
      ...createdUser,
      password: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.repo.findOne({
      where: {
        email: loginAuthDto.email,
      },
    });
    if (!user) {
      throw new NotFoundException('Invalid Credentials');
    }
    await comparePassword(loginAuthDto.password, user.password);
    return {
      ...user,
      password: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
  }
}
