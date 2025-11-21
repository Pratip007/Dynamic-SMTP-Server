const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbDialect = process.env.DB_DIALECT || 'sqlite';
const env = process.env.NODE_ENV || 'development';

// Database configuration - supports both SQLite and PostgreSQL
let config;

if (dbDialect === 'postgres') {
  // PostgreSQL configuration
  config = {
    development: {
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'smtp_server',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      logging: console.log,
    },
    production: {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      logging: false,
    }
  };
} else {
  // SQLite configuration (default)
  config = {
    development: {
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      logging: console.log,
    },
    production: {
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      logging: false,
    }
  };
}

const sequelize = new Sequelize(config[env]);

module.exports = sequelize;

