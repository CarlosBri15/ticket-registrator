import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';
import { permissions } from '@ticket-registrator/shared';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Protected user creation
  @RequireAnyPermission(permissions.CREATE_USERS)
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.usersService.create(createUserDto, user);
  }

  @RequireAnyPermission(permissions.VIEW_USERS)
  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.usersService.findAll(user);
  }

  @Get('me')
  findMe(@CurrentUser() user: UserPayload) {
    return this.usersService.findMe(user.id);
  }

  @RequireAnyPermission(permissions.EDIT_USERS)
  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @RequireAnyPermission(permissions.DELETE_USERS)
  @Delete(':id')
  remove(@Param('id') userId: string, @CurrentUser() user: UserPayload) {
    return this.usersService.remove(userId, user);
  }
}
