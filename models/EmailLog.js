const { mongoose } = require('../config/mongodb');

const emailLogSchema = new mongoose.Schema({
  landing_page_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandingPage',
    required: false,
  },
  smtp_config_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmtpConfig',
    required: false,
  },
  recipient: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'sent', 'failed'],
  },
  error_message: {
    type: String,
    required: false,
  },
  sent_at: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
  collection: 'email_logs',
});

// Indexes for faster queries
emailLogSchema.index({ landing_page_id: 1 });
emailLogSchema.index({ smtp_config_id: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ createdAt: -1 }); // For sorting by date

const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;
