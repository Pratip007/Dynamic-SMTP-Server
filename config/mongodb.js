const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING;

let mongooseConnection = null;

/**
 * Connect to MongoDB
 */
async function connectMongoDB() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI or MONGODB_CONNECTION_STRING environment variable is not set');
    }

    // Connection options (Mongoose 8.x doesn't need useNewUrlParser/useUnifiedTopology)
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    mongooseConnection = await mongoose.connect(MONGODB_URI, options);
    
    console.log('✓ MongoDB connection established');
    return mongooseConnection;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectMongoDB() {
  try {
    if (mongooseConnection) {
      await mongoose.disconnect();
      console.log('✓ MongoDB disconnected');
    }
  } catch (error) {
    console.error('✗ MongoDB disconnection error:', error.message);
    throw error;
  }
}

/**
 * Check if MongoDB is connected
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✓ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠ Mongoose disconnected from MongoDB');
});

module.exports = {
  connectMongoDB,
  disconnectMongoDB,
  isConnected,
  mongoose,
};

