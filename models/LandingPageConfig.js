const { mongoose } = require('../config/mongodb');

const landingPageConfigSchema = new mongoose.Schema({
  landing_page_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandingPage',
    required: true,
  },
  smtp_config_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmtpConfig',
    required: true,
  },
  from_email: {
    type: String,
    required: true,
  },
  from_name: {
    type: String,
    required: true,
  },
  reply_to_email: {
    type: String,
    required: false,
  },
  to_email: {
    type: String,
    required: true,
  },
  subject_template: {
    type: String,
    default: 'New Inquiry from {{landingPageName}}',
  },
}, {
  timestamps: true,
  collection: 'landing_page_configs',
});

// One config per landing page
landingPageConfigSchema.index({ landing_page_id: 1 }, { unique: true });
landingPageConfigSchema.index({ smtp_config_id: 1 });

const LandingPageConfig = mongoose.models.LandingPageConfig || mongoose.model('LandingPageConfig', landingPageConfigSchema);

module.exports = LandingPageConfig;
