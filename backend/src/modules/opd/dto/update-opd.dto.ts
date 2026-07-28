import { PartialType } from '@nestjs/swagger';
import { CreateOpdDto } from './create-opd.dto';

export class UpdateOpdDto extends PartialType(CreateOpdDto) {}
