import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Delete,
    ParseUUIDPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireAnyPermission } from '../auth/decorators/permissions.decorator';
import { permissions } from '@ticket-registrator/shared';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @RequireAnyPermission(permissions.CREATE_CATEGORIES)
    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @RequireAnyPermission(permissions.VIEW_CATEGORIES)
    @Get('organization/:orgId')
    findAllByOrganization(@Param('orgId', ParseUUIDPipe) orgId: string) {
        return this.categoriesService.findAllByOrganization(orgId);
    }

    @RequireAnyPermission(permissions.VIEW_CATEGORIES)
    @Get('system')
    findAllSystem() {
        return this.categoriesService.findAllSystemCategories();
    }

    @RequireAnyPermission(permissions.VIEW_CATEGORIES)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriesService.findOne(id);
    }

    @RequireAnyPermission(permissions.EDIT_CATEGORIES)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @RequireAnyPermission(permissions.DELETE_CATEGORIES)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriesService.softDelete(id);
    }

    @RequireAnyPermission(permissions.CREATE_CATEGORIES)
    @Post('organization/:orgId/defaults')
    createFromDefaults(
        @Param('orgId', ParseUUIDPipe) orgId: string,
        @Body() body: { categoryNames?: string[] },
    ) {
        return this.categoriesService.createDefaultFromSystem(
            orgId,
            body.categoryNames,
        );
    }
}
