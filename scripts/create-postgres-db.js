const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to PostgreSQL server (not a specific database)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL server');

    const dbName = process.env.DB_NAME || 'smtp_server';
    
    // Check if database exists
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const dbExists = await client.query(checkDbQuery, [dbName]);

    if (dbExists.rows.length > 0) {
      console.log(`✓ Database "${dbName}" already exists`);
    } else {
      // Create database (database name cannot be parameterized, but it's from env so it's safe)
      // Escape the database name to prevent SQL injection
      const escapedDbName = `"${dbName.replace(/"/g, '""')}"`;
      await client.query(`CREATE DATABASE ${escapedDbName}`);
      console.log(`✓ Database "${dbName}" created successfully`);
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating database:', error.message);
    await client.end();
    process.exit(1);
  }
}

createDatabase();

