import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ICreateUser } from '@ticket-registrator/shared';


export class CreateUserDto implements ICreateUser {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  surname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
