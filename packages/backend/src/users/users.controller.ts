import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Protected user creation
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    const creator = {
      role: req.user.role,
      companyId: req.user.companyId,         
      departmentId: req.user.departmentId, 
      permissions: req.user.permissions,
    };

    return this.usersService.create(createUserDto, creator);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() req) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,         
      departmentId: req.user.departmentId, 
      permissions: req.user.permissions,
    };
    return this.usersService.findAll(requester);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMe(@Req() req) {
    return this.usersService.findMe(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const requester = {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
      departmentId: req.user.departmentId,
      permissions: req.user.permissions,
    };

    return this.usersService.update(id, updateUserDto, requester);
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') userId: string, @Req() req) {
    const requester = {
      id: req.user.id,            
      role: req.user.role,
      companyId: req.user.companyId,         
      departmentId: req.user.departmentId, 
      permissions: req.user.permissions,
    };

    return this.usersService.remove(userId, requester);
  }
}
