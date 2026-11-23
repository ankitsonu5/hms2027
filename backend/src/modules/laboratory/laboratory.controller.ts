import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LaboratoryService } from './laboratory.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { UpdateLabOrderDto } from './dto/update-lab-order.dto';
import { CreateLabResultDto } from './dto/create-lab-result.dto';
import { TestMasterService } from './test-master.service';
import { LabReportService } from './lab-report.service';
import { ApproveReportDto, SaveOrderResultsDto, UpdateReportSettingsDto } from './dto/lab-report.dto';
import {
  CreateLabMasterDto,
  SaveRangesDto,
  SaveTestDefinitionDto,
  UpdateLabMasterDto,
} from './dto/test-definition.dto';

// Inline query DTO to avoid standalone class issues
class TestQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  search?: string;

  @IsOptional()
  category?: string;

  @IsOptional()
  isActive?: boolean | string;

  @IsOptional()
  testType?: string;
}

class OrderQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  patientId?: string;

  @IsOptional()
  status?: string;
}

@ApiTags('Laboratory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'laboratory', version: '1' })
export class LaboratoryController {
  constructor(
    private readonly labService: LaboratoryService,
    private readonly testMaster: TestMasterService,
    private readonly reports: LabReportService,
  ) {}

  // ── Report settings (letterhead, signatures, columns) ──────────────────────

  @Get('report-settings')
  @ApiOperation({ summary: 'Lab report print settings' })
  getReportSettings(@Req() req: any) {
    return this.reports.getSettings(req.user.tenantId);
  }

  @Put('report-settings')
  @ApiOperation({ summary: 'Update lab report print settings' })
  updateReportSettings(@Req() req: any, @Body() dto: UpdateReportSettingsDto) {
    return this.reports.updateSettings(req.user.tenantId, dto);
  }

  // ── Result entry & report ──────────────────────────────────────────────────

  @Get('orders/:id/worksheet')
  @ApiOperation({ summary: 'Tests, parameters, patient-specific normal values and saved results of an order' })
  worksheet(@Req() req: any, @Param('id') id: string) {
    return this.reports.worksheet(req.user.tenantId, id);
  }

  @Put('orders/:id/results')
  @ApiOperation({ summary: 'Save parameter results of an order (flags are calculated on the server)' })
  saveOrderResults(@Req() req: any, @Param('id') id: string, @Body() dto: SaveOrderResultsDto) {
    return this.reports.saveResults(req.user.tenantId, id, dto, req.user);
  }

  @Post('orders/:id/approve')
  @ApiOperation({ summary: 'Approve (verify) or un-approve a report' })
  approveReport(@Req() req: any, @Param('id') id: string, @Body() dto: ApproveReportDto) {
    return this.reports.setApproval(req.user.tenantId, id, dto.approve, req.user);
  }

  @Post('orders/:id/printed')
  @ApiOperation({ summary: 'Count a report print' })
  markPrinted(@Req() req: any, @Param('id') id: string) {
    return this.reports.markPrinted(req.user.tenantId, id);
  }

  // ── Test master: lookup lists ──────────────────────────────────────────────

  @Get('masters')
  @ApiOperation({ summary: 'List units / sample types / categories / methods' })
  @ApiQuery({ name: 'kind', required: false, type: String })
  listMasters(@Req() req: any, @Query('kind') kind?: string) {
    return this.testMaster.listMasters(req.user.tenantId, kind);
  }

  @Post('masters')
  @ApiOperation({ summary: 'Add a unit / sample type / category / method' })
  createMaster(@Req() req: any, @Body() dto: CreateLabMasterDto) {
    return this.testMaster.createMaster(req.user.tenantId, dto);
  }

  @Post('masters/seed-standard')
  @ApiOperation({ summary: 'Load the standard test library (CBC, LFT, KFT…); existing tests are skipped' })
  seedStandard(@Req() req: any) {
    return this.testMaster.seedStandard(req.user.tenantId);
  }

  @Patch('masters/:id')
  updateMaster(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLabMasterDto) {
    return this.testMaster.updateMaster(req.user.tenantId, id, dto);
  }

  @Delete('masters/:id')
  removeMaster(@Req() req: any, @Param('id') id: string) {
    return this.testMaster.removeMaster(req.user.tenantId, id);
  }

  // ── Test master: definitions (test + parameters + normal values) ────────────

  @Post('test-definitions')
  @ApiOperation({ summary: 'Create a test with its parameters and normal values' })
  createDefinition(@Req() req: any, @Body() dto: SaveTestDefinitionDto) {
    return this.testMaster.createDefinition(req.user.tenantId, dto);
  }

  @Put('test-definitions/:id')
  @ApiOperation({ summary: 'Replace a test definition (parameters keep their ids when sent back)' })
  updateDefinition(@Req() req: any, @Param('id') id: string, @Body() dto: SaveTestDefinitionDto) {
    return this.testMaster.updateDefinition(req.user.tenantId, id, dto);
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Get a test definition with parameters and normal values' })
  getDefinition(@Req() req: any, @Param('id') id: string) {
    return this.testMaster.getDefinition(req.user.tenantId, id);
  }

  @Post('tests/:id/duplicate')
  @ApiOperation({ summary: 'Copy a test definition' })
  duplicateDefinition(@Req() req: any, @Param('id') id: string) {
    return this.testMaster.duplicateDefinition(req.user.tenantId, id);
  }

  @Put('parameters/:id/ranges')
  @ApiOperation({ summary: 'Replace the normal values of one parameter' })
  saveRanges(@Req() req: any, @Param('id') id: string, @Body() dto: SaveRangesDto) {
    return this.testMaster.saveRanges(req.user.tenantId, id, dto.ranges);
  }

  // ── Lab Tests ──────────────────────────────────────────────────────────────

  @Get('tests')
  @ApiOperation({ summary: 'List all lab tests (master catalogue)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAllTests(@Req() req: any, @Query() query: TestQueryDto) {
    let isActiveValue: boolean | undefined = undefined;
    if (query.isActive === 'true' || query.isActive === true) isActiveValue = true;
    if (query.isActive === 'false' || query.isActive === false) isActiveValue = false;

    return this.labService.findAllTests(
      req.user.tenantId,
      query.page,
      query.limit,
      query.search,
      query.category,
      isActiveValue,
      query.testType,
    );
  }

  @Post('tests')
  @ApiOperation({ summary: 'Create a lab test in master catalogue' })
  createTest(@Req() req: any, @Body() dto: CreateLabTestDto) {
    return this.labService.createTest(req.user.tenantId, dto);
  }

  @Patch('tests/:id')
  @ApiOperation({ summary: 'Update a lab test' })
  updateTest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateLabTestDto,
  ) {
    return this.labService.updateTest(req.user.tenantId, id, dto);
  }

  @Delete('tests/:id')
  @ApiOperation({ summary: 'Soft-delete a lab test' })
  removeTest(@Req() req: any, @Param('id') id: string) {
    return this.labService.removeTest(req.user.tenantId, id);
  }

  @Post('tests/:id/restore')
  @ApiOperation({ summary: 'Restore a cancelled lab test' })
  restoreTest(@Req() req: any, @Param('id') id: string) {
    return this.labService.restoreTest(req.user.tenantId, id);
  }

  // ── Lab Orders ─────────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'List lab orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAllOrders(@Req() req: any, @Query() query: OrderQueryDto) {
    return this.labService.findAllOrders(
      req.user.tenantId,
      query.page,
      query.limit,
      query.patientId,
      query.status,
    );
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get a single lab order by ID' })
  findOneOrder(@Req() req: any, @Param('id') id: string) {
    return this.labService.findOneOrder(req.user.tenantId, id);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create a lab order' })
  createOrder(@Req() req: any, @Body() dto: CreateLabOrderDto) {
    return this.labService.createOrder(req.user.tenantId, dto);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update a lab order (status, sample, payment)' })
  updateOrder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateLabOrderDto,
  ) {
    return this.labService.updateOrder(req.user.tenantId, id, dto);
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: 'Soft-delete a lab order' })
  removeOrder(@Req() req: any, @Param('id') id: string) {
    return this.labService.removeOrder(req.user.tenantId, id);
  }

  // ── Lab Results ────────────────────────────────────────────────────────────

  @Get('orders/:orderId/results')
  @ApiOperation({ summary: 'Get all results for a lab order' })
  findResultsByOrder(@Req() req: any, @Param('orderId') orderId: string) {
    return this.labService.findResultsByOrder(req.user.tenantId, orderId);
  }

  @Post('orders/:orderId/results')
  @ApiOperation({ summary: 'Create or update a result for a lab order test' })
  upsertResult(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: CreateLabResultDto,
  ) {
    return this.labService.upsertResult(req.user.tenantId, { ...dto, orderId });
  }
}
