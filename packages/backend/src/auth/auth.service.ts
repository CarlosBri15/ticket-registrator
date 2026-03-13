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

    const role = user.role;
    const departmentIds = (user as any).usersToDepartments.map((ud: any) => ud.departmentId);

    const payload = {
      sub: user.id,
      username: user.username,
      roleName: role?.name,
      roleHierarchy: role?.hierarchy,
      companyId: user.companyId,
      departmentIds: departmentIds,
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
