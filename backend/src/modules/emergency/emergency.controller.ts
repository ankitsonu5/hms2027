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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { QueryEmergencyDto } from './dto/query-emergency.dto';

@ApiTags('Emergency')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'emergency', version: '1' })
export class EmergencyController {
  constructor(private readonly service: EmergencyService) {}

  @Get()
  @ApiOperation({ summary: 'List emergency records with optional filters' })
  findAll(@Request() req: any, @Query() query: QueryEmergencyDto) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single emergency record by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new emergency record' })
  create(@Request() req: any, @Body() dto: CreateEmergencyDto) {
    return this.service.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an emergency record' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyDto,
  ) {
    return this.service.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an emergency record' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.tenantId, id);
  }
}
