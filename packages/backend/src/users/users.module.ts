import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CryptoModule } from '../crypto/crypto.module';
import { RolesModule } from '../roles/roles.module';
import { UsersRepository } from './users.repository';
import { UsersAuthorizationService } from './users-authorization.service';

@Module({
  imports: [CryptoModule, RolesModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersAuthorizationService],
  exports: [UsersService],
})
export class UsersModule {}
