import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/user.entity';
import { IpdService } from './ipd.service';
import { CreateWardDto } from './dto/create-ward.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { QueryAdmissionDto } from './dto/query-admission.dto';
import { BedStatus } from './bed.entity';

@ApiTags('IPD')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'ipd', version: '1' })
export class IpdController {
  constructor(private readonly ipdService: IpdService) {}

  // ─── Wards ───────────────────────────────────────────────────────────────────

  @Get('wards')
  @ApiOperation({ summary: 'List all active wards' })
  findAllWards(@CurrentUser() user: User) {
    return this.ipdService.findAllWards(user.tenantId);
  }

  @Post('wards')
  @ApiOperation({ summary: 'Create a ward' })
  createWard(@CurrentUser() user: User, @Body() dto: CreateWardDto) {
    return this.ipdService.createWard(user.tenantId, dto);
  }

  @Delete('wards/:id')
  @ApiOperation({ summary: 'Delete a ward' })
  deleteWard(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ipdService.deleteWard(user.tenantId, id);
  }

  // ─── Beds ─────────────────────────────────────────────────────────────────────

  @Get('beds')
  @ApiOperation({
    summary: 'List beds, optionally filtered by wardId / status',
  })
  @ApiQuery({ name: 'wardId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BedStatus })
  findAllBeds(
    @CurrentUser() user: User,
    @Query('wardId') wardId?: string,
    @Query('status') status?: BedStatus,
  ) {
    return this.ipdService.findAllBeds(user.tenantId, wardId, status);
  }

  @Post('beds')
  @ApiOperation({ summary: 'Create a bed' })
  createBed(
    @CurrentUser() user: User,
    @Body() dto: { wardId: string; bedNumber: string; status?: BedStatus },
  ) {
    return this.ipdService.createBed(user.tenantId, dto);
  }

  @Patch('beds/:id/status')
  @ApiOperation({ summary: 'Update bed status (e.g. VACANT, CLEANING)' })
  updateBedStatus(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: BedStatus,
  ) {
    return this.ipdService.updateBedStatus(user.tenantId, id, status);
  }

  @Delete('beds/:id')
  @ApiOperation({ summary: 'Delete a bed' })
  deleteBed(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.ipdService.deleteBed(user.tenantId, id);
  }

  // ─── Admissions ───────────────────────────────────────────────────────────────

  @Get('admissions')
  @ApiOperation({ summary: 'List IPD admissions (paginated)' })
  findAllAdmissions(
    @CurrentUser() user: User,
    @Query() query: QueryAdmissionDto,
  ) {
    return this.ipdService.findAllAdmissions(user.tenantId, query);
  }

  @Get('admissions/:id')
  @ApiOperation({ summary: 'Get a single IPD admission by id' })
  findOneAdmission(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ipdService.findOneAdmission(user.tenantId, id);
  }

  @Post('admissions')
  @ApiOperation({
    summary: 'Admit a patient (creates admission, occupies bed)',
  })
  createAdmission(
    @CurrentUser() user: User,
    @Body() dto: CreateAdmissionDto,
  ) {
    return this.ipdService.createAdmission(user.tenantId, dto);
  }

  @Patch('admissions/:id')
  @ApiOperation({ summary: 'Update an IPD admission' })
  updateAdmission(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdmissionDto,
  ) {
    return this.ipdService.updateAdmission(user.tenantId, id, dto);
  }

  @Post('admissions/:id/transfer')
  @ApiOperation({ summary: 'Transfer patient to a different ward/bed' })
  transferBed(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { targetWardId: string; targetBedId: string; reason?: string },
  ) {
    return this.ipdService.transferBed(user.tenantId, id, dto);
  }

  @Post('admissions/:id/vitals')
  @ApiOperation({ summary: 'Record inpatient clinical vitals' })
  addVitals(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.ipdService.addVitals(user.tenantId, id, dto);
  }

  @Post('admissions/:id/notes')
  @ApiOperation({ summary: 'Add doctor rounds / clinical progress note' })
  addClinicalNote(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.ipdService.addClinicalNote(user.tenantId, id, dto);
  }

  @Post('admissions/:id/discharge')
  @ApiOperation({ summary: 'Discharge a patient (sets bed to CLEANING)' })
  dischargePatient(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto?: { dischargeSummary?: string; dischargeCondition?: string },
  ) {
    return this.ipdService.dischargePatient(user.tenantId, id, dto);
  }

  @Get('admissions/:id/bill')
  @ApiOperation({ summary: 'Get official IPD bill for admission' })
  getAdmissionBill(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ipdService.getAdmissionBill(user.tenantId, id);
  }

  @Patch('admissions/:id/bill')
  @ApiOperation({ summary: 'Edit/update IPD bill amounts and items for admission' })
  updateAdmissionBill(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.ipdService.updateAdmissionBill(user.tenantId, id, dto);
  }
}
