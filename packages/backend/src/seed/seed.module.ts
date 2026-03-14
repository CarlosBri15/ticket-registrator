import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
  imports: [RolesModule, PermissionsModule, CryptoModule],
  providers: [SeedService],
})
export class SeedModule {}
