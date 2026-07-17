import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { Roles } from '@shared/types';
import { UpdateUserMessageDto,CreateUserDto } from '@shared/dtos/user.dtos';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('findAllUsers')
  async findAll(
    @Payload() data: { page: number; limit: number; search: string },
  ) {
    return this.usersService.findAll(data.page, data.limit, data.search);
  }

  @MessagePattern('findOneUser')
  async findOne(@Payload() data: { id: string }) {
    return this.usersService.findOne(data.id);
  }

  @MessagePattern('createUser')
  async create(
    @Payload()
    data: CreateUserDto,
  ) {
    return this.usersService.create(data);
  }

  @MessagePattern('updateUser')
  async update(
    @Payload()
    data: UpdateUserMessageDto,
  ) {
    return this.usersService.update(data);
  }
}
