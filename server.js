const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allow all origins, methods, and headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for admin dashboard
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);
app.use('/admin/api', adminRoutes);

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SMTP Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Sync database models (creates tables if they don't exist)
    // For SQLite, we need to handle foreign keys differently
    const dbDialect = process.env.DB_DIALECT || 'sqlite';
    
    if (dbDialect === 'sqlite') {
      // For SQLite, use plain sync() to only create tables if they don't exist
      // This avoids foreign key constraint errors when trying to alter tables
      try {
        await sequelize.sync({ force: false, alter: false });
      } catch (error) {
        // If there's a foreign key error, it means tables exist with constraints
        // Just log and continue - the tables are already there
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          console.log('⚠ Database tables already exist with foreign key constraints');
          console.log('  Skipping schema sync to avoid constraint errors');
        } else {
          throw error;
        }
      }
    } else {
      // For PostgreSQL, use alter: true safely
      await sequelize.sync({ alter: true });
    }
    console.log('✓ Database models synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ Admin dashboard: http://localhost:${PORT}/admin`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api/send-inquiry`);
    });
  } catch (error) {
    console.error('✗ Unable to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();

