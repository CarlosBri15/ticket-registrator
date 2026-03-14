import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../crypto/crypto.service';
import { LoginDto } from './dto/auth.dto';
import { ILoginResponse } from '@ticket-registrator/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) { }

  async login(loginDto: LoginDto): Promise<ILoginResponse> {
    const user = await this.usersService.findByEmail(loginDto.email as string);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.cryptoService.comparePassword(
      loginDto.password as string,
      user.password as string,
    );

    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const role = user.role;
    const departmentIds = (user as any).usersToDepartments.map((ud: any) => ud.departmentId);

    const payload = {
      sub: user.id,
      username: user.username,
      roleName: role?.name,
      roleHierarchy: role?.hierarchy,
      companyId: user.companyId,
      departmentIds,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
