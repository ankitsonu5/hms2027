import {
  Controller,
  Get,
  Post,
  Patch,
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
  createAdmission(@CurrentUser() user: User, @Body() dto: CreateAdmissionDto) {
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

  @Post('admissions/:id/discharge')
  @ApiOperation({ summary: 'Discharge a patient (sets bed to CLEANING)' })
  dischargePatient(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ipdService.dischargePatient(user.tenantId, id);
  }
}
