const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectMongoDB, isConnected: isMongoConnected, disconnectMongoDB } = require('./config/mongodb');
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
  const health = {
    status: 'ok',
    message: 'SMTP Server is running',
    timestamp: new Date().toISOString(),
    database: {
      mongodb: isMongoConnected() ? 'connected' : 'disconnected'
    }
  };
  res.json(health);
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
    // Connect to MongoDB (required)
    if (!process.env.MONGODB_URI && !process.env.MONGODB_CONNECTION_STRING) {
      throw new Error('MONGODB_URI or MONGODB_CONNECTION_STRING environment variable is required');
    }
    
    await connectMongoDB();
    console.log('✓ MongoDB connection established');
    
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
  
  // Disconnect MongoDB
  if (isMongoConnected()) {
    await disconnectMongoDB();
  }
  
  process.exit(0);
});

startServer();
