const { sequelize } = require('../models');

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Sync all models (creates tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✓ Database tables created/updated');
    
    console.log('\n✓ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();

