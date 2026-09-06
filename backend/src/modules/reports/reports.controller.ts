import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('overview')
  @ApiQuery({ name: 'months', required: false, example: 12 })
  overview(@Req() req: any, @Query('months') months?: string) {
    return this.reports.overview(req.user.tenantId, months ? Number(months) : 12);
  }
}
