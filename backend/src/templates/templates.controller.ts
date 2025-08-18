import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { RequireAdmin } from '../auth/decorators/admin.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplateCategory } from '../entities/template.entity';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  async getTemplates(
    @Query('category') category?: TemplateCategory,
    @Query('popular') popular?: string,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters = {
      category,
      popular: popular === 'true',
      featured: featured === 'true',
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    };

    return this.templatesService.getTemplates(filters);
  }

  @Get('popular')
  async getPopularTemplates(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.templatesService.getPopularTemplates(limitNum);
  }

  @Get('categories')
  async getCategories() {
    return this.templatesService.getCategories();
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templatesService.getTemplate(id);
  }

  @Get(':id/use')
  @UseGuards(JwtAuthGuard)
  async trackTemplateUsage(@Param('id') id: string, @Request() req: any) {
    return this.templatesService.trackTemplateUsage(id, req.user.userId);
  }

  // Admin endpoint for seeding templates
  @Get('admin/seed')
  @RequireAdmin()
  async seedTemplates(@Request() req: any) {
    // Log admin action for audit trail
    console.log(`Admin template seeding initiated by: ${req.adminUser.email}`);
    return this.templatesService.seedTemplates();
  }
}