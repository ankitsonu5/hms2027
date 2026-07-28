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
  constructor(private readonly labService: LaboratoryService) {}

  // ── Lab Tests ──────────────────────────────────────────────────────────────

  @Get('tests')
  @ApiOperation({ summary: 'List all lab tests (master catalogue)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  findAllTests(@Req() req: any, @Query() query: TestQueryDto) {
    return this.labService.findAllTests(
      req.user.tenantId,
      query.page,
      query.limit,
      query.search,
      query.category,
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
