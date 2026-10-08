const { validateSync } = require('class-validator');
const { plainToInstance } = require('class-transformer');
const { IsArray, IsNotEmpty, IsString, IsOptional, IsEnum } = require('class-validator');

class CreateSaleDto {
  @IsArray()
  @IsNotEmpty()
  items;
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
