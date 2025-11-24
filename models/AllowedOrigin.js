const { mongoose } = require('../config/mongodb');

const allowedOriginSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  is_active: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'allowed_origins',
});

// Index for faster lookups
allowedOriginSchema.index({ origin: 1 });
allowedOriginSchema.index({ is_active: 1 });

// Validation: ensure origin is a valid URL format
allowedOriginSchema.pre('save', function(next) {
  if (this.origin === '*') {
    return next(); // Allow wildcard
  }
  
  try {
    const url = new URL(this.origin);
    // Ensure it's a valid origin format (protocol + host, no path)
    if (url.pathname !== '/' || url.search || url.hash) {
      this.origin = `${url.protocol}//${url.host}`;
    }
  } catch (error) {
    // If not a valid URL, it might be a domain without protocol
    // Try to normalize it
    if (!this.origin.startsWith('http://') && !this.origin.startsWith('https://')) {
      this.origin = `https://${this.origin}`;
    }
  }
  
  next();
});

const AllowedOrigin = mongoose.models.AllowedOrigin || mongoose.model('AllowedOrigin', allowedOriginSchema);

module.exports = AllowedOrigin;

