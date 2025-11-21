const sequelize = require('../config/database');
const SmtpConfig = require('./SmtpConfig');
const LandingPage = require('./LandingPage');
const LandingPageConfig = require('./LandingPageConfig');
const EmailLog = require('./EmailLog');

// Define associations
LandingPageConfig.belongsTo(LandingPage, { foreignKey: 'landing_page_id' });
LandingPageConfig.belongsTo(SmtpConfig, { foreignKey: 'smtp_config_id' });
LandingPage.hasOne(LandingPageConfig, { foreignKey: 'landing_page_id' });
SmtpConfig.hasMany(LandingPageConfig, { foreignKey: 'smtp_config_id' });

EmailLog.belongsTo(LandingPage, { foreignKey: 'landing_page_id' });
EmailLog.belongsTo(SmtpConfig, { foreignKey: 'smtp_config_id' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  SmtpConfig,
  LandingPage,
  LandingPageConfig,
  EmailLog,
};

