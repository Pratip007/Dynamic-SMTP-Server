const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LandingPageConfig = sequelize.define('LandingPageConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  landing_page_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'landing_pages',
      key: 'id',
    },
    comment: 'Foreign key to landing_pages',
  },
  smtp_config_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'smtp_configs',
      key: 'id',
    },
    comment: 'Foreign key to smtp_configs',
  },
  from_email: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'From email address (e.g., sales@company.com)',
  },
  from_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'From name (e.g., "Sales Team")',
  },
  reply_to_email: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reply-to email address (optional)',
  },
  to_email: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Recipient email address where inquiries will be sent',
  },
  subject_template: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'New Inquiry from {{landingPageName}}',
    comment: 'Email subject template (can use {{variables}})',
  },
}, {
  tableName: 'landing_page_configs',
  timestamps: true,
  underscored: true,
});

module.exports = LandingPageConfig;

