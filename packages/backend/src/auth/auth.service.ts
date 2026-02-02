import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/auth.dto';
import { ILoginResponse } from '@ticket-registrator/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) : Promise<ILoginResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, username: user.username };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
