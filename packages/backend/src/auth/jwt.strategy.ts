import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
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