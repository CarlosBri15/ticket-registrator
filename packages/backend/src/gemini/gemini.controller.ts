import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { GeminiService } from './gemini.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { permissions } from '@ticket-registrator/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @RequireAnyPermission(permissions.CREATE_TICKETS)
  @Post('extract-receipt')
  @UseInterceptors(FileInterceptor('file'))
  async extractReceipt(
    @CurrentUser() user: UserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const imageBase64 = file.buffer.toString('base64');
    return this.geminiService.extractReceipt(imageBase64, user.companyId);
  }
}
