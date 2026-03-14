import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StorageService } from './storage.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { permissions } from '@ticket-registrator/shared';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @RequireAnyPermission(permissions.VIEW_TICKETS)
  @Get(':filename')
  async findFile(@Param('filename') fileName: string) {
    const url = await this.storageService.findFile(fileName);
    return { url, expiresIn: '15 minutes' };
  }

  @RequireAnyPermission(permissions.DELETE_TICKETS)
  @Delete(':filename')
  async removeFile(@Param('filename') fileName: string) {
    await this.storageService.removeFile(fileName);
    return { message: 'File removed', fileName };
  }
}
