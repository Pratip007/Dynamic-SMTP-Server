const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  landing_page_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'landing_pages',
      key: 'id',
    },
  },
  smtp_config_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'smtp_configs',
      key: 'id',
    },
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Status: pending, sent, failed',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'email_logs',
  timestamps: true,
  underscored: true,
});

module.exports = EmailLog;

