import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}

  @Get()
  findAll(@Request() req, @Query() query: QueryDepartmentDto) {
    const tenantId = req.user?.tenantId || '0b2fb3ce-2065-4246-81b8-e6f5791dc4b7';
    return this.service.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || '0b2fb3ce-2065-4246-81b8-e6f5791dc4b7';
    return this.service.findOne(tenantId, id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateDepartmentDto) {
    const tenantId = req.user?.tenantId || '0b2fb3ce-2065-4246-81b8-e6f5791dc4b7';
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    const tenantId = req.user?.tenantId || '0b2fb3ce-2065-4246-81b8-e6f5791dc4b7';
    return this.service.update(tenantId, id, dto);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || '0b2fb3ce-2065-4246-81b8-e6f5791dc4b7';
    return this.service.toggleStatus(tenantId, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || '0b2fb3ce-2065-4246-81b8-e6f5791dc4b7';
    return this.service.remove(tenantId, id);
  }
}
