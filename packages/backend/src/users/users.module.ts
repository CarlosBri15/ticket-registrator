import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    forwardRef(() => AuthModule), // <-- circular dependency
    RolesModule,
  ],

  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
