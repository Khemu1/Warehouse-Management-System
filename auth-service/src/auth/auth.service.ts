import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@shared/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateAuthDto, LoginAuthDto } from '@shared//dtos/auth.dtos';
import { comparePassword, hashPassword, isEmailTaken } from './auth.helpers';
import { Roles } from '@shared/types';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(createAuthDto: CreateAuthDto) {
    await isEmailTaken(this.repo.manager, createAuthDto.email);
    const hashedPassword = await hashPassword(createAuthDto.password);
    createAuthDto.password = hashedPassword;
    const createdUser = await this.repo.save(createAuthDto, {
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

  async doesUserWithRoleExist(id: string, role: Roles[]) {
    const user = await this.repo.findOne({
      where: {
        id,
        role: In(role),
      },
    });

    return user;
  }
}
