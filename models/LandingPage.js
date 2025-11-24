const { mongoose } = require('../config/mongodb');

const landingPageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  identifier: {
    type: String,
    required: true,
    unique: true,
  },
  is_active: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'landing_pages',
});

// Index for faster queries
landingPageSchema.index({ identifier: 1 }, { unique: true });
landingPageSchema.index({ is_active: 1 });

const LandingPage = mongoose.models.LandingPage || mongoose.model('LandingPage', landingPageSchema);

module.exports = LandingPage;
