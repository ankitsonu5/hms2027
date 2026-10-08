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
    const results = await AppDataSource.query(`SELECT id, items, subtotal FROM pharmacy_sales`);
    
    for (const row of results) {
      if (row.id === '1de4eb95-e183-4343-8a02-d8183a6e35b8' || row.subtotal === '670') {
        const updatedItems = [{
           drugName: "Paracetamol",
           quantity: 10,
           saleRate: 67,
           gstPercent: 0
        }];
        
        await AppDataSource.query(`UPDATE pharmacy_sales SET items = $1 WHERE id = $2`, [JSON.stringify(updatedItems), row.id]);
        console.log(`Updated row ${row.id} with quantity 10 and saleRate 67`);
      }
    }
    
    console.log("Done fixing DB.");
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
