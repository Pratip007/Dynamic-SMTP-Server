const nodemailer = require('nodemailer');
const { SmtpConfig, LandingPageConfig, LandingPage, EmailLog } = require('../models');
const { decrypt } = require('../utils/encryption');

/**
 * Create SMTP transporter from config
 */
async function createTransporter(smtpConfigId) {
  try {
    const smtpConfig = await SmtpConfig.findByPk(smtpConfigId);
    
    if (!smtpConfig) {
      throw new Error('SMTP config not found');
    }
    
    if (!smtpConfig.is_active) {
      throw new Error('SMTP config is not active');
    }
    
    // Decrypt password
    const decryptedPassword = decrypt(smtpConfig.password);
    if (!decryptedPassword) {
      throw new Error('Failed to decrypt SMTP password');
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure, // true for 465, false for other ports
      auth: {
        user: smtpConfig.username,
        pass: decryptedPassword,
      },
    });
    
    return transporter;
  } catch (error) {
    console.error('Error creating transporter:', error);
    throw error;
  }
}

/**
 * Test SMTP connection
 */
async function testConnection(smtpConfigId) {
  try {
    const transporter = await createTransporter(smtpConfigId);
    await transporter.verify();
    return { success: true, message: 'SMTP connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Send email using SMTP config
 */
async function sendEmail(smtpConfigId, emailOptions) {
  try {
    const transporter = await createTransporter(smtpConfigId);
    
    const info = await transporter.sendMail(emailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send inquiry email for a landing page
 */
async function sendInquiryEmail(landingPageIdentifier, formData) {
  try {
    // Find landing page by identifier
    const landingPage = await LandingPage.findOne({
      where: { identifier: landingPageIdentifier, is_active: true },
      include: [{
        model: LandingPageConfig,
        include: [{
          model: SmtpConfig,
          where: { is_active: true },
        }],
      }],
    });
    
    if (!landingPage || !landingPage.LandingPageConfig) {
      throw new Error('Landing page not found or not configured');
    }
    
    const config = landingPage.LandingPageConfig;
    const smtpConfig = config.SmtpConfig;
    
    // Build email subject
    let subject = config.subject_template || 'New Inquiry from {{landingPageName}}';
    subject = subject.replace('{{landingPageName}}', landingPage.name);
    
    // Build email HTML body
    const htmlBody = `
      <h2>New Inquiry from ${landingPage.name}</h2>
      <p><strong>From:</strong> ${formData.name || 'N/A'} &lt;${formData.email || 'N/A'}&gt;</p>
      ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
      ${formData.message ? `<p><strong>Message:</strong></p><p>${formData.message.replace(/\n/g, '<br>')}</p>` : ''}
      <hr>
      <p><small>This email was sent from ${landingPage.identifier}</small></p>
    `;
    
    // Build plain text body
    const textBody = `
New Inquiry from ${landingPage.name}

From: ${formData.name || 'N/A'} <${formData.email || 'N/A'}>
${formData.phone ? `Phone: ${formData.phone}\n` : ''}
${formData.message ? `Message:\n${formData.message}\n` : ''}

---
This email was sent from ${landingPage.identifier}
    `.trim();
    
    // Prepare email options
    const emailOptions = {
      from: `"${config.from_name}" <${config.from_email}>`,
      to: config.to_email,
      replyTo: config.reply_to_email || formData.email || config.from_email,
      subject: subject,
      text: textBody,
      html: htmlBody,
    };
    
    // Send email
    const result = await sendEmail(smtpConfig.id, emailOptions);
    
    // Log email
    await EmailLog.create({
      landing_page_id: landingPage.id,
      smtp_config_id: smtpConfig.id,
      recipient: config.to_email,
      subject: subject,
      status: 'sent',
      sent_at: new Date(),
    });
    
    return {
      success: true,
      message: 'Inquiry email sent successfully',
      messageId: result.messageId,
    };
  } catch (error) {
    // Log failed email
    try {
      const landingPage = await LandingPage.findOne({
        where: { identifier: landingPageIdentifier },
      });
      
      if (landingPage) {
        await EmailLog.create({
          landing_page_id: landingPage.id,
          recipient: 'unknown',
          subject: 'Failed to send',
          status: 'failed',
          error_message: error.message,
        });
      }
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }
    
    throw error;
  }
}

module.exports = {
  createTransporter,
  testConnection,
  sendEmail,
  sendInquiryEmail,
};

