import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly configService: ConfigService) {}

  private get pepper(): string {
    const value = this.configService.get<string>('PASSWORD_PEPPER');
    if (!value) throw new Error('PASSWORD_PEPPER is not defined in the environment');
    return value;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password + this.pepper, this.SALT_ROUNDS);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain + this.pepper, hash);
  }
}
