import { ILogin } from '@ticket-registrator/shared';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto implements ILogin {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  password: string;
}
