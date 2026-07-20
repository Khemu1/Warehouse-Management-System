import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { hashPassword } from '../auth/auth.helpers';
import { User } from '@shared/entities/user.entity';
import { Roles } from '@shared/types';
import { CreateUserDto, UpdateUserMessageDto } from '@shared/dtos/user.dtos';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findAll(page = 1, limit = 10, search = ''): Promise<Pagination<User>> {
    const where = search
      ? [{ name: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }]
      : {};

    return paginate<User>(
      this.repo,
      { page, limit },
      {
        where,
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          role: true,
        },
        order: { created_at: 'DESC' },
      },
    );
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: CreateUserDto) {
    const existing = await this.repo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await hashPassword(data.password);
    const user = this.repo.create({ ...data, password: hashedPassword });
    const saved = await this.repo.save(user);
    const { password, created_at, updated_at, ...result } = saved;
    return result;
  }

  async update(data: UpdateUserMessageDto) {
    const user = await this.repo.findOne({ where: { id: data.id } });
    if (!user) throw new NotFoundException('User not found');

    if (data.email && data.email !== user.email) {
      const existing = await this.repo.findOne({
        where: { email: data.email },
      });
      if (existing) throw new ConflictException('Email already exists');
    }

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    await this.repo.update({ id: data.id }, data);
    return this.findOne(data.id);
  }
  async delete(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.repo.delete({ id });
  }
}
