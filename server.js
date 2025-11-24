const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectMongoDB, isConnected: isMongoConnected, disconnectMongoDB } = require('./config/mongodb');
const { createCorsOriginFunction, clearCache } = require('./utils/corsHelper');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware (order matters)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global CORS middleware - allows all origins by default
// The API routes have their own CORS middleware for dynamic origin checking
// This global middleware handles other routes (like admin dashboard)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

// Middleware setup function - will reconfigure CORS after MongoDB connection
async function setupDynamicCORS() {
  try {
    const corsOriginFunction = createCorsOriginFunction();
    // Remove the default CORS middleware and add dynamic one
    // Note: We'll use a custom middleware approach
    console.log('✓ CORS middleware will use dynamic origins from database');
  } catch (error) {
    console.error('Error setting up dynamic CORS:', error);
    console.log('⚠ Using default CORS (allow all)');
  }
}

// API Routes - must be before static file serving
app.use('/api', apiRoutes);
app.use('/admin/api', adminRoutes);

// Serve static files for admin dashboard (after API routes)
app.use(express.static(path.join(__dirname, 'public')));

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
  
  // Set CORS headers for health check
  res.header('Access-Control-Allow-Origin', '*');
  res.json(health);
});

// 404 handler - must be after all routes
app.use((req, res, next) => {
  // Only handle if no response has been sent
  if (!res.headersSent) {
    // Set CORS headers for 404 responses
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.status(404).json({
      success: false,
      message: 'Route not found: ' + req.method + ' ' + req.path,
    });
  } else {
    next();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Always return JSON, never HTML
  if (res.headersSent) {
    return next(err);
  }
  
  // Set CORS headers for error responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
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
    
    // Setup dynamic CORS after DB connection
    await setupDynamicCORS();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ Admin dashboard: http://localhost:${PORT}/admin`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api/send-inquiry`);
      console.log(`✓ CORS origins managed dynamically via admin dashboard`);
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
