const express = require('express');
const { body, validationResult } = require('express-validator');
const { SmtpConfig, LandingPage, LandingPageConfig, EmailLog } = require('../models');
const { encrypt } = require('../utils/encryption');
const { testConnection } = require('../services/smtpService');
const router = express.Router();

// ==================== SMTP Configs ====================

/**
 * GET /admin/smtp-configs
 * List all SMTP configurations
 */
router.get('/smtp-configs', async (req, res) => {
  try {
    const configs = await SmtpConfig.find()
      .select('-password') // Don't send password
      .sort({ createdAt: -1 });
    
    // Ensure both id and _id are available for compatibility
    const configsWithId = configs.map(config => {
      const configObj = config.toObject();
      configObj.id = configObj._id.toString();
      return configObj;
    });
    
    res.json({
      success: true,
      data: configsWithId,
    });
  } catch (error) {
    console.error('Error fetching SMTP configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SMTP configs',
    });
  }
});

/**
 * GET /admin/smtp-configs/:id
 * Get single SMTP configuration
 */
router.get('/smtp-configs/:id', async (req, res) => {
  try {
    const config = await SmtpConfig.findById(req.params.id)
      .select('-password');
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'SMTP config not found',
      });
    }
    
    // Ensure both id and _id are available
    const configObj = config.toObject();
    configObj.id = configObj._id.toString();
    
    res.json({
      success: true,
      data: configObj,
    });
  } catch (error) {
    console.error('Error fetching SMTP config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SMTP config',
    });
  }
});

/**
 * POST /admin/smtp-configs
 * Create new SMTP configuration
 */
router.post(
  '/smtp-configs',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('host').notEmpty().withMessage('Host is required'),
    body('port').isInt({ min: 1, max: 65535 }).withMessage('Valid port is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }
      
      const { name, host, port, secure, username, password, provider } = req.body;
      
      // Encrypt password
      const encryptedPassword = encrypt(password);
      
      const config = await SmtpConfig.create({
        name,
        host,
        port: port || 587,
        secure: secure || false,
        username,
        password: encryptedPassword,
        provider: provider || 'custom',
        is_active: true,
      });
      
      const configObj = config.toObject();
      configObj.id = configObj._id.toString();
      
      res.status(201).json({
        success: true,
        message: 'SMTP config created successfully',
        data: configObj,
      });
    } catch (error) {
      console.error('Error creating SMTP config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create SMTP config',
      });
    }
  }
);

/**
 * PUT /admin/smtp-configs/:id
 * Update SMTP configuration
 */
router.put(
  '/smtp-configs/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('host').optional().notEmpty().withMessage('Host cannot be empty'),
    body('port').optional().isInt({ min: 1, max: 65535 }).withMessage('Valid port is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }
      
      const config = await SmtpConfig.findById(req.params.id);
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'SMTP config not found',
        });
      }
      
      const updateData = { ...req.body };
      
      // Encrypt password if provided
      if (updateData.password) {
        updateData.password = encrypt(updateData.password);
      } else {
        delete updateData.password;
      }
      
      // Update fields
      Object.assign(config, updateData);
      await config.save();
      
      const configObj = config.toObject();
      configObj.id = configObj._id.toString();
      
      res.json({
        success: true,
        message: 'SMTP config updated successfully',
        data: configObj,
      });
    } catch (error) {
      console.error('Error updating SMTP config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update SMTP config',
      });
    }
  }
);

/**
 * DELETE /admin/smtp-configs/:id
 * Delete SMTP configuration
 */
router.delete('/smtp-configs/:id', async (req, res) => {
  try {
    const config = await SmtpConfig.findByIdAndDelete(req.params.id);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'SMTP config not found',
      });
    }
    
    res.json({
      success: true,
      message: 'SMTP config deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting SMTP config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete SMTP config',
    });
  }
});

/**
 * POST /admin/smtp-configs/:id/test
 * Test SMTP connection
 */
router.post('/smtp-configs/:id/test', async (req, res) => {
  try {
    const result = await testConnection(req.params.id);
    
    res.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to test connection',
    });
  }
});

// ==================== Landing Pages ====================

/**
 * GET /admin/landing-pages
 * List all landing pages
 */
router.get('/landing-pages', async (req, res) => {
  try {
    const pages = await LandingPage.find()
      .sort({ createdAt: -1 });
    
    // Populate configs for each page
    const pagesWithConfigs = await Promise.all(
      pages.map(async (page) => {
        const config = await LandingPageConfig.findOne({ landing_page_id: page._id })
          .populate('smtp_config_id', '_id name host provider');
        
        const pageObj = page.toObject();
        // Ensure both id and _id are strings
        pageObj.id = String(pageObj._id);
        pageObj._id = String(pageObj._id);
        
        pageObj.LandingPageConfig = config ? (() => {
          const configObj = config.toObject();
          // Handle populated smtp_config_id - it's an object with _id when populated
          if (configObj.smtp_config_id) {
            if (typeof configObj.smtp_config_id === 'object' && configObj.smtp_config_id._id) {
              const smtpId = configObj.smtp_config_id._id;
              configObj.smtp_config_id.id = String(smtpId);
              configObj.smtp_config_id._id = String(smtpId);
            } else {
              // If smtp_config_id is just an ObjectId, convert it to string
              configObj.smtp_config_id = String(configObj.smtp_config_id);
            }
          }
          // Also ensure landing_page_id is a string
          if (configObj.landing_page_id) {
            configObj.landing_page_id = String(configObj.landing_page_id);
          }
          return configObj;
        })() : null;
        return pageObj;
      })
    );
    
    res.json({
      success: true,
      data: pagesWithConfigs,
    });
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing pages',
    });
  }
});

/**
 * POST /admin/landing-pages
 * Create new landing page
 */
router.post(
  '/landing-pages',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('identifier').notEmpty().withMessage('Identifier is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }
      
      const { name, identifier } = req.body;
      
      const page = await LandingPage.create({
        name,
        identifier,
        is_active: true,
      });
      
      const pageObj = page.toObject();
      pageObj.id = pageObj._id.toString();
      
      res.status(201).json({
        success: true,
        message: 'Landing page created successfully',
        data: pageObj,
      });
    } catch (error) {
      if (error.code === 11000) { // MongoDB duplicate key error
        return res.status(400).json({
          success: false,
          message: 'Identifier already exists',
        });
      }
      console.error('Error creating landing page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create landing page',
      });
    }
  }
);

/**
 * PUT /admin/landing-pages/:id/config
 * Update landing page configuration (SMTP mapping and From field)
 */
router.put(
  '/landing-pages/:id/config',
  [
    body('smtp_config_id').notEmpty().withMessage('Valid SMTP config ID is required'),
    body('from_email').isEmail().withMessage('Valid from email is required'),
    body('from_name').notEmpty().withMessage('From name is required'),
    body('to_email').isEmail().withMessage('Valid to email is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }
      
      const landingPage = await LandingPage.findById(req.params.id);
      if (!landingPage) {
        return res.status(404).json({
          success: false,
          message: 'Landing page not found',
        });
      }
      
      const { smtp_config_id, from_email, from_name, reply_to_email, to_email, subject_template } = req.body;
      
      // Check if SMTP config exists
      const smtpConfig = await SmtpConfig.findById(smtp_config_id);
      if (!smtpConfig) {
        return res.status(404).json({
          success: false,
          message: 'SMTP config not found',
        });
      }
      
      // Create or update landing page config (upsert)
      const config = await LandingPageConfig.findOneAndUpdate(
        { landing_page_id: landingPage._id },
        {
          landing_page_id: landingPage._id,
          smtp_config_id: smtp_config_id,
          from_email,
          from_name,
          reply_to_email: reply_to_email || null,
          to_email,
          subject_template: subject_template || null,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
      
      res.json({
        success: true,
        message: 'Landing page config updated successfully',
        data: config,
      });
    } catch (error) {
      console.error('Error updating landing page config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update landing page config',
      });
    }
  }
);

/**
 * DELETE /admin/landing-pages/:id
 * Delete landing page
 */
router.delete('/landing-pages/:id', async (req, res) => {
  try {
    const landingPage = await LandingPage.findById(req.params.id);
    if (!landingPage) {
      return res.status(404).json({
        success: false,
        message: 'Landing page not found',
      });
    }
    
    // Delete associated config if exists
    await LandingPageConfig.deleteOne({ landing_page_id: landingPage._id });
    
    // Delete landing page
    await LandingPage.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Landing page deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete landing page',
    });
  }
});

/**
 * GET /admin/email-logs
 * Get email logs
 */
router.get('/email-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
      const logs = await EmailLog.find()
      .populate('landing_page_id', '_id name identifier')
      .populate('smtp_config_id', '_id name provider')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    
    // Ensure both id and _id are available for populated fields
    const logsWithId = logs.map(log => {
      const logObj = log.toObject();
      if (logObj.landing_page_id) {
        logObj.landing_page_id.id = logObj.landing_page_id._id.toString();
      }
      if (logObj.smtp_config_id) {
        logObj.smtp_config_id.id = logObj.smtp_config_id._id.toString();
      }
      return logObj;
    });
    
    const total = await EmailLog.countDocuments();
    
    res.json({
      success: true,
      data: logsWithId,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email logs',
    });
  }
});

module.exports = router;
