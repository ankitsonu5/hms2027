const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'hmsadmin',
  password: 'hmspassword',
  database: 'postgres', // Connect to default DB to create a new one
});

client.connect()
  .then(() => {
    console.log('Connected. Creating hospital_lite_db...');
    return client.query('CREATE DATABASE hospital_lite_db');
  })
  .then(() => {
    console.log('Database created successfully.');
    return client.end();
  })
  .catch((err) => {
    if (err.code === '42P04') {
        console.log('Database already exists.');
        return client.end();
    }
    console.error('Error creating db:', err);
    process.exit(1);
  });
