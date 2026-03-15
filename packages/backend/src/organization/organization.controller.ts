import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationService } from './organization.service';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { permissions } from '@ticket-registrator/shared';
import type { UserPayload } from '../auth/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @RequireAnyPermission(permissions.CREATE_COMPANY)
  @Post('onboard')
  onboard(
    @CurrentUser() requester: UserPayload,
    @Body() dto: OnboardOrganizationDto,
  ) {
    return this.organizationService.onboard(requester, dto);
  }

  @RequireAnyPermission(permissions.VIEW_COMPANY)
  @Get()
  findAll(@CurrentUser() requester: UserPayload) {
    return this.organizationService.findAll(requester);
  }

  @RequireAnyPermission(permissions.VIEW_COMPANY)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @RequireAnyPermission(permissions.EDIT_COMPANY)
  @Patch(':id')
  update(
    @CurrentUser() requester: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(requester, id, dto);
  }

  @RequireAnyPermission(permissions.DELETE_COMPANY)
  @Delete(':id')
  softDelete(@CurrentUser() requester: UserPayload, @Param('id') id: string) {
    return this.organizationService.softDelete(requester, id);
  }
}
