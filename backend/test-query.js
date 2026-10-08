const { Client } = require('pg');
const client = new Client('postgres://postgres:postgres@localhost:5432/hms');
client.connect()
  .then(() => client.query('SELECT items FROM pharmacy_sales ORDER BY "createdAt" DESC LIMIT 2'))
  .then(res => console.log(JSON.stringify(res.rows, null, 2)))
  .catch(console.error)
  .finally(() => client.end());
