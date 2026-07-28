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
import { OpdService } from './opd.service';
import { CreateOpdDto } from './dto/create-opd.dto';
import { UpdateOpdDto } from './dto/update-opd.dto';
import { QueryOpdDto } from './dto/query-opd.dto';

@ApiTags('OPD')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'opd', version: '1' })
export class OpdController {
  constructor(private readonly opdService: OpdService) {}

  @ApiOperation({ summary: 'List OPD encounters with filters and pagination' })
  @Get()
  findAll(@Request() req, @Query() query: QueryOpdDto) {
    const tenantId: string = req.user.tenantId;
    return this.opdService.findAll(tenantId, query);
  }

  @ApiOperation({ summary: 'Get a single OPD encounter by ID' })
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId: string = req.user.tenantId;
    return this.opdService.findOne(tenantId, id);
  }

  @ApiOperation({ summary: 'Create a new OPD encounter' })
  @Post()
  create(@Request() req, @Body() dto: CreateOpdDto) {
    const tenantId: string = req.user.tenantId;
    return this.opdService.create(tenantId, dto);
  }

  @ApiOperation({ summary: 'Update an existing OPD encounter' })
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateOpdDto) {
    const tenantId: string = req.user.tenantId;
    return this.opdService.update(tenantId, id, dto);
  }

  @ApiOperation({ summary: 'Soft-delete an OPD encounter' })
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const tenantId: string = req.user.tenantId;
    return this.opdService.remove(tenantId, id);
  }
}
