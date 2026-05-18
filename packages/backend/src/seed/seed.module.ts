import { Module, forwardRef } from '@nestjs/common';
import { SeedService } from './seed.service';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CryptoModule } from '../crypto/crypto.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    forwardRef(() => RolesModule),
    PermissionsModule,
    CryptoModule,
    CategoriesModule,
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
