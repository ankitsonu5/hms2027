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
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { QueryBillDto } from './dto/query-bill.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'billing', version: '1' })
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  findAll(@Query() query: QueryBillDto, @Req() req: any) {
    return this.billingService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.billingService.findOne(req.user.tenantId, id);
  }

  @Post()
  create(@Body() dto: CreateBillDto, @Req() req: any) {
    return this.billingService.create(req.user.tenantId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBillDto, @Req() req: any) {
    return this.billingService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.billingService.cancel(req.user.tenantId, id);
  }

  @Post(':id/payments')
  addPayment(
    @Param('id') id: string,
    @Body() dto: AddPaymentDto,
    @Req() req: any,
  ) {
    return this.billingService.addPayment(req.user.tenantId, {
      ...dto,
      billId: id,
    });
  }
}
