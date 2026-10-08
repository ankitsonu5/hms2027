import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PhlebotomistService } from './phlebotomist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('phlebotomists')
export class PhlebotomistController {
  constructor(private readonly phleboService: PhlebotomistService) {}

  @Get()
  findAll(@Request() req) {
    return this.phleboService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.phleboService.findOne(req.user.tenantId, id);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.phleboService.create(req.user.tenantId, data);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.phleboService.update(req.user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.phleboService.remove(req.user.tenantId, id);
  }
}
