import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

interface JwtPayload {
  sub: string;
  username: string;
  roleName: string;
  roleHierarchy: number;
  companyId: string;
  departmentIds: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const userRole = await this.usersService.findUserRole(payload.sub);
    if (!userRole) throw new UnauthorizedException();

    return {
      id: payload.sub,
      username: payload.username,
      roleId: userRole.roleId,
      roleName: payload.roleName,
      roleHierarchy: payload.roleHierarchy,
      companyId: payload.companyId,
      departmentIds: payload.departmentIds,
    };
  }
}
