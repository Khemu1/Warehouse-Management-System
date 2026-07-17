import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { AllowedRoles } from '@shared/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from '@shared/dtos/user.dtos';
import { type ISafeClient, Roles } from '@shared/types';
import { RateLimit } from '@shared/decorators/rate-limit.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PaginatedUsersResponse,
  UserResponse,
  ApiErrorResponse,
} from '@shared/dtos/responses.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@AllowedRoles(Roles.ADMIN)
@RateLimit()
export class UsersController {
  constructor(@Inject('AUTH_SERVICE') private authClient: ISafeClient) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedUsersResponse })
  @ApiResponse({ status: 401, type: ApiErrorResponse })
  @ApiResponse({ status: 403, type: ApiErrorResponse })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
  ) {
    return this.authClient.send('findAllUsers', {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.authClient.send('findOneUser', { id });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserResponse })
  @ApiResponse({ status: 400, type: ApiErrorResponse })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    type: ApiErrorResponse,
  })
  create(@Body() dto: CreateUserDto) {
    return this.authClient.send('createUser', dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiResponse({ status: 404, type: ApiErrorResponse })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.authClient.send('updateUser', { id, ...dto });
  }
}
