import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './user.entity';

@ApiTags('Clinicians')
@Controller({ path: 'clinicians', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all clinicians (doctors)' })
  findAll(@CurrentUser() user: User) {
    return this.userService.findAllDoctors(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new clinician' })
  create(@CurrentUser() user: User, @Body() data: any) {
    return this.userService.createDoctor(user.tenantId, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a clinician' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() data: any) {
    return this.userService.updateDoctor(user.tenantId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a clinician' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.userService.deleteDoctor(user.tenantId, id);
  }
}
