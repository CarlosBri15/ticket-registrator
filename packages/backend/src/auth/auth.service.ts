import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/auth.dto';
import { ILoginResponse } from '@ticket-registrator/shared';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  // Getter ensures pepper is always a string at runtime
  private get pepper(): string {
    const value = this.configService.get<string>('PASSWORD_PEPPER');
    if (!value) {
      throw new Error('PASSWORD_PEPPER is not defined in the environment');
    }
    return value;
  }

  async login(loginDto: LoginDto): Promise<ILoginResponse> {
    const user = await this.usersService.findByEmail(loginDto.email as string);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(
      loginDto.password + this.pepper,
      user.password,
    );

    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // TODO: Re-enable once new roles/permissions system is complete
    // const permissionDoc = await this.usersService.getUserPermissions(user.id);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.roleId, // TODO: replace with role name lookup once roles module is ready
      companyId: user.companyId,
      departmentId: user.departmentId,
      permissions: [], // TODO: resolve permissions from roleId once roles module is ready
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }


  // Hash password with pepper before saving
  async hashPassword(password: string): Promise<string> {
    const salted = password + this.pepper;
    const saltRounds = 10;
    return bcrypt.hash(salted, saltRounds);
  }
}
