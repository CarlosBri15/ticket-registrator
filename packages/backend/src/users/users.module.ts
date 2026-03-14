import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CryptoModule } from '../crypto/crypto.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [CryptoModule, RolesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
