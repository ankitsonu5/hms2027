import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'patients', version: '1' })
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  findAll(@Query() query: QueryPatientDto, @Req() req: any) {
    return this.patientService.findAll(req.user.tenantId, query);
  }

  @Get('search')
  findByUhid(@Query('uhid') uhid: string, @Req() req: any) {
    return this.patientService.findByUhid(req.user.tenantId, uhid);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.patientService.findOne(req.user.tenantId, id);
  }

  @Post()
  create(@Body() dto: CreatePatientDto, @Req() req: any) {
    return this.patientService.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Req() req: any,
  ) {
    return this.patientService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.patientService.remove(req.user.tenantId, id);
  }
}
