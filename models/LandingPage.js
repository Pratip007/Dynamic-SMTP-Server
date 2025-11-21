const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LandingPage = sequelize.define('LandingPage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Display name for landing page (e.g., "Product Page 1")',
  },
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique identifier/slug (e.g., "product-page-1")',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this landing page is active',
  },
}, {
  tableName: 'landing_pages',
  timestamps: true,
  underscored: true,
});

module.exports = LandingPage;

