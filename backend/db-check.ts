import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'hmsadmin',
  password: 'hmspassword',
  database: 'hms_db',
});

AppDataSource.initialize()
  .then(async () => {
    const results = await AppDataSource.query(`SELECT id, items, subtotal, "totalAmount" FROM pharmacy_sales ORDER BY "createdAt" DESC LIMIT 5`);
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
