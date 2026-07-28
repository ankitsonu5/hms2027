import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { QueryDrugDto } from './dto/query-drug.dto';
import { AddBatchDto } from './dto/add-batch.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Pharmacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'pharmacy', version: '1' })
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // ── Drugs ──────────────────────────────────────────────────────────

  @Get('drugs')
  @ApiOperation({
    summary: 'List drugs with optional search and schedule filter',
  })
  findAllDrugs(
    @CurrentUser() user: { tenantId: string },
    @Query() query: QueryDrugDto,
  ) {
    return this.pharmacyService.findAllDrugs(user.tenantId, query);
  }

  @Post('drugs')
  @ApiOperation({ summary: 'Create a new drug master record' })
  createDrug(
    @CurrentUser() user: { tenantId: string },
    @Body() dto: CreateDrugDto,
  ) {
    return this.pharmacyService.createDrug(user.tenantId, dto);
  }

  @Get('drugs/:id')
  @ApiOperation({ summary: 'Get drug by id' })
  findDrugById(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.pharmacyService.findDrugById(user.tenantId, id);
  }

  @Patch('drugs/:id')
  @ApiOperation({ summary: 'Update drug master record' })
  updateDrug(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateDrugDto,
  ) {
    return this.pharmacyService.updateDrug(user.tenantId, id, dto);
  }

  // ── Batches ────────────────────────────────────────────────────────

  @Get('drugs/:id/batches')
  @ApiOperation({ summary: 'List batches for a drug' })
  findBatchesByDrug(
    @CurrentUser() user: { tenantId: string },
    @Param('id') drugId: string,
  ) {
    return this.pharmacyService.findBatchesByDrug(user.tenantId, drugId);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Add a new drug batch (GRN)' })
  addBatch(
    @CurrentUser() user: { tenantId: string },
    @Body() dto: AddBatchDto,
  ) {
    return this.pharmacyService.addBatch(user.tenantId, dto);
  }

  // ── Sales ──────────────────────────────────────────────────────────

  @Get('sales')
  @ApiOperation({ summary: 'List pharmacy sales with optional patient filter' })
  findAllSales(
    @CurrentUser() user: { tenantId: string },
    @Query('patientId') patientId: string | undefined,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.pharmacyService.findAllSales(
      user.tenantId,
      patientId,
      Number(page),
      Number(limit),
    );
  }

  @Post('sales')
  @ApiOperation({ summary: 'Create a new pharmacy sale' })
  createSale(
    @CurrentUser() user: { tenantId: string; id: string },
    @Body() dto: CreateSaleDto,
  ) {
    return this.pharmacyService.createSale(user.tenantId, dto, user.id);
  }
}
