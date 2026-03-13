import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { permissions } from '@ticket-registrator/shared';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Protected user creation
  @RequireAnyPermission(permissions.CREATE_USERS)
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    const creator = {
      roleId: req.user.roleId,
      roleName: req.user.roleName,
      roleHierarchy: req.user.roleHierarchy,
      companyId: req.user.companyId,
      departmentIds: req.user.departmentIds,
      permissions: req.user.permissions,
    };

    return this.usersService.create(createUserDto, creator);
  }

  @RequireAnyPermission(permissions.VIEW_USERS)
  @Get()
  findAll(@Req() req) {
    const requester = {
      id: req.user.id,
      roleId: req.user.roleId,
      roleName: req.user.roleName,
      roleHierarchy: req.user.roleHierarchy,
      companyId: req.user.companyId,
      departmentIds: req.user.departmentIds,
      permissions: req.user.permissions,
    };
    return this.usersService.findAll(requester);
  }

  @Get('me')
  findMe(@Req() req) {
    return this.usersService.findMe(req.user.id);
  }

  @RequireAnyPermission(permissions.EDIT_USERS)
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const requester = {
      id: req.user.id,
      roleId: req.user.roleId,
      roleName: req.user.roleName,
      roleHierarchy: req.user.roleHierarchy,
      companyId: req.user.companyId,
      departmentIds: req.user.departmentIds,
      permissions: req.user.permissions,
    };

    return this.usersService.update(id, updateUserDto, requester);
  }


  @RequireAnyPermission(permissions.DELETE_USERS)
  @Delete(':id')
  remove(@Param('id') userId: string, @Req() req) {
    const requester = {
      id: req.user.id,
      roleId: req.user.roleId,
      roleName: req.user.roleName,
      roleHierarchy: req.user.roleHierarchy,
      companyId: req.user.companyId,
      departmentIds: req.user.departmentIds,
      permissions: req.user.permissions,
    };

    return this.usersService.remove(userId, requester);
  }
}
