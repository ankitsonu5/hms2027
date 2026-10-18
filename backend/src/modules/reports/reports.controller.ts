import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation } from '@nestjs/swagger';
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

  @Get('smart-settings')
  @ApiOperation({ summary: 'Get smart report settings for tenant' })
  getSmartSettings(@Req() req: any) {
    return this.reports.getSmartReportSettings(req.user.tenantId);
  }

  @Post('smart-settings')
  @ApiOperation({ summary: 'Save smart report settings in database' })
  saveSmartSettings(@Req() req: any, @Body() body: any) {
    return this.reports.updateSmartReportSettings(req.user.tenantId, body);
  }

  @Post('smart-settings/preferences')
  @ApiOperation({ summary: 'Save smart report preferences in database' })
  savePreferences(
    @Req() req: any,
    @Body() body: { accountPreferences?: Record<string, boolean>; testPreferences?: Record<string, boolean> },
  ) {
    return this.reports.updateSmartReportPreferences(
      req.user.tenantId,
      body.accountPreferences,
      body.testPreferences,
    );
  }
}

