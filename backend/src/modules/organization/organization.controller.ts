import { Controller, Get, Post, Body, Param, Put, Request, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get()
  findAll(@Request() req) {
    return this.orgService.findAll(req.user.tenantId);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.orgService.create(req.user.tenantId, data);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.orgService.findOne(req.user.tenantId, id);
  }

  @Get(':id/rates')
  getRates(@Request() req, @Param('id') id: string) {
    return this.orgService.getRates(req.user.tenantId, id);
  }

  @Put(':id/rates')
  upsertRate(@Request() req, @Param('id') id: string, @Body() data: { testId: string; customPrice: number }) {
    return this.orgService.upsertRate(req.user.tenantId, id, data);
  }
}
