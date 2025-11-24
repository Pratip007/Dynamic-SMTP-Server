const { mongoose } = require('../config/mongodb');

const smtpConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    required: true,
    default: 587,
  },
  secure: {
    type: Boolean,
    required: true,
    default: false,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, // Encrypted password
  },
  provider: {
    type: String,
    required: true,
    default: 'custom',
    enum: ['gmail', 'sendgrid', 'ses', 'custom'],
  },
  is_active: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'smtp_configs',
});

// Index for faster queries
smtpConfigSchema.index({ is_active: 1 });
smtpConfigSchema.index({ provider: 1 });

const SmtpConfig = mongoose.models.SmtpConfig || mongoose.model('SmtpConfig', smtpConfigSchema);

module.exports = SmtpConfig;
