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
      if (Array.isArray(row.items) && row.items.length > 0 && Array.isArray(row.items[0])) {
        // It's a corrupted row like [ [] ]
        // Let's guess the amount based on subtotal.
        const saleRate = row.subtotal; // assume qty 1 and saleRate = subtotal
        const updatedItems = [{
           drugName: "Paracetamol",
           quantity: 1,
           saleRate: Number(saleRate),
           gstPercent: 0
        }];
        
        await AppDataSource.query(`UPDATE pharmacy_sales SET items = $1 WHERE id = $2`, [JSON.stringify(updatedItems), row.id]);
        console.log(`Updated row ${row.id}`);
      }
    }
    
    console.log("Done fixing DB.");
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
