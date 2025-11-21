const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SmtpConfig = sequelize.define('SmtpConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Display name for this SMTP account (e.g., "Gmail Account 1")',
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'SMTP server host (e.g., smtp.gmail.com)',
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 587,
    comment: 'SMTP server port (587 for TLS, 465 for SSL)',
  },
  secure: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'true for SSL (port 465), false for TLS (port 587)',
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'SMTP username/email',
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Encrypted SMTP password',
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'custom',
    comment: 'SMTP provider (gmail, sendgrid, ses, custom)',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this SMTP config is active',
  },
}, {
  tableName: 'smtp_configs',
  timestamps: true,
  underscored: true,
});

module.exports = SmtpConfig;

