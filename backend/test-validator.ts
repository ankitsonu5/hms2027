import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateSaleDto {
  @IsArray()
  @IsNotEmpty()
  items!: Array<{
    drugId?: string;
    drugName?: string;
    quantity: number;
    mrp: number;
    saleRate: number;
    gstPercent: number;
  }>;
}

const payload = {
  items: [
    {
      drugId: 'uuid',
      drugName: 'Paracetamol',
      quantity: 10,
      saleRate: 50
    }
  ]
};

const instance = plainToInstance(CreateSaleDto, payload);
const errors = validateSync(instance, { whitelist: true, forbidNonWhitelisted: true });
console.log("Errors:", errors.length > 0 ? errors : "None");
console.log("Instance items:", JSON.stringify(instance.items));
