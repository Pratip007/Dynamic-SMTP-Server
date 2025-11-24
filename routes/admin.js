const express = require('express');
const { body, validationResult } = require('express-validator');
const { SmtpConfig, LandingPage, LandingPageConfig, EmailLog, AllowedOrigin } = require('../models');
const { encrypt } = require('../utils/encryption');
const { testConnection } = require('../services/smtpService');
const { clearCache } = require('../utils/corsHelper');
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
      
      // Handle landing_page_id - check if it's populated (object) or just an ObjectId
    
      if (logObj.landing_page_id) {
        if (typeof logObj.landing_page_id === 'object' && logObj.landing_page_id._id) {
          // It's populated, ensure id field exists
          logObj.landing_page_id.id = logObj.landing_page_id._id.toString();
          // Ensure name is available (should be from populate, but double-check)
          if (!logObj.landing_page_id.name) {
            logObj.landing_page_id.name = 'Unknown';
          }
        } else {
          // It's just an ObjectId, set to null (landing page might be deleted)
          logObj.landing_page_id = null;
        }
      }
      
      // Handle smtp_config_id
      if (logObj.smtp_config_id) {
        if (typeof logObj.smtp_config_id === 'object' && logObj.smtp_config_id._id) {
          logObj.smtp_config_id.id = logObj.smtp_config_id._id.toString();
        } else {
          logObj.smtp_config_id = null;
        }
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

// ==================== Allowed Origins (CORS) ====================

/**
 * GET /admin/api/allowed-origins
 * List all allowed origins
 */
router.get('/allowed-origins', async (req, res) => {
  console.log('GET /admin/api/allowed-origins - Route hit');
  try {
    const origins = await AllowedOrigin.find()
      .sort({ createdAt: -1 });
    
    const originsWithId = origins.map(origin => {
      const originObj = origin.toObject();
      originObj.id = originObj._id.toString();
      return originObj;
    });
    
    res.json({
      success: true,
      data: originsWithId,
    });
  } catch (error) {
    console.error('Error fetching allowed origins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allowed origins',
    });
  }
});

/**
 * POST /admin/api/allowed-origins
 * Create new allowed origin
 */
router.post(
  '/allowed-origins',
  [
    body('origin')
      .notEmpty()
      .withMessage('Origin is required')
      .isString()
      .withMessage('Origin must be a string'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
  ],
  async (req, res) => {
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    try {
      console.log('POST /admin/allowed-origins - Request received:', {
        origin: req.body.origin,
        description: req.body.description,
        body: req.body,
      });
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }
      
      const { origin, description } = req.body;
      
      // Normalize origin
      let normalizedOrigin = origin.trim();
      if (normalizedOrigin !== '*') {
        // Remove trailing slashes
        normalizedOrigin = normalizedOrigin.replace(/\/+$/, '');
        
        // If it doesn't start with http:// or https://, add https://
        if (!normalizedOrigin.startsWith('http://') && !normalizedOrigin.startsWith('https://')) {
          normalizedOrigin = `https://${normalizedOrigin}`;
        }
        
        try {
          const url = new URL(normalizedOrigin);
          // Extract only protocol and host (remove path, query, hash)
          normalizedOrigin = `${url.protocol}//${url.host}`;
        } catch (e) {
          // Invalid URL, return error
          return res.status(400).json({
            success: false,
            message: 'Invalid origin format. Must be a valid URL (e.g., https://example.com) or *. Error: ' + e.message,
          });
        }
      }
      
      // Check if origin already exists
      const existing = await AllowedOrigin.findOne({ origin: normalizedOrigin });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Origin already exists',
        });
      }
      
      const newOrigin = await AllowedOrigin.create({
        origin: normalizedOrigin,
        description: description || '',
        is_active: true,
      });
      
      const originObj = newOrigin.toObject();
      originObj.id = originObj._id.toString();
      
      // Clear CORS cache to apply changes immediately
      clearCache();
      
      res.status(201).json({
        success: true,
        message: 'Allowed origin created successfully',
        data: originObj,
      });
    } catch (error) {
      console.error('Error creating allowed origin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create allowed origin: ' + (error.message || 'Unknown error'),
      });
    }
  }
);

/**
 * PUT /admin/allowed-origins/:id
 * Update allowed origin
 */
router.put(
  '/allowed-origins/:id',
  [
    body('origin')
      .optional()
      .isString()
      .withMessage('Origin must be a string'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active must be a boolean'),
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
      
      const origin = await AllowedOrigin.findById(req.params.id);
      if (!origin) {
        return res.status(404).json({
          success: false,
          message: 'Allowed origin not found',
        });
      }
      
      const updateData = {};
      
      if (req.body.origin !== undefined) {
        let normalizedOrigin = req.body.origin.trim();
        if (normalizedOrigin !== '*') {
          if (!normalizedOrigin.startsWith('http://') && !normalizedOrigin.startsWith('https://')) {
            normalizedOrigin = `https://${normalizedOrigin}`;
          }
          try {
            const url = new URL(normalizedOrigin);
            normalizedOrigin = `${url.protocol}//${url.host}`;
          } catch (e) {
            return res.status(400).json({
              success: false,
              message: 'Invalid origin format',
            });
          }
        }
        
        // Check if another origin with same value exists
        const existing = await AllowedOrigin.findOne({ 
          origin: normalizedOrigin,
          _id: { $ne: req.params.id }
        });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Origin already exists',
          });
        }
        
        updateData.origin = normalizedOrigin;
      }
      
      if (req.body.description !== undefined) {
        updateData.description = req.body.description;
      }
      
      if (req.body.is_active !== undefined) {
        updateData.is_active = req.body.is_active;
      }
      
      Object.assign(origin, updateData);
      await origin.save();
      
      const originObj = origin.toObject();
      originObj.id = originObj._id.toString();
      
      // Clear CORS cache to apply changes immediately
      clearCache();
      
      res.json({
        success: true,
        message: 'Allowed origin updated successfully',
        data: originObj,
      });
    } catch (error) {
      console.error('Error updating allowed origin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update allowed origin',
      });
    }
  }
);

/**
 * DELETE /admin/allowed-origins/:id
 * Delete allowed origin
 */
router.delete('/allowed-origins/:id', async (req, res) => {
  try {
    const origin = await AllowedOrigin.findById(req.params.id);
    if (!origin) {
      return res.status(404).json({
        success: false,
        message: 'Allowed origin not found',
      });
    }
    
    await AllowedOrigin.findByIdAndDelete(req.params.id);
    
    // Clear CORS cache to apply changes immediately
    clearCache();
    
    res.json({
      success: true,
      message: 'Allowed origin deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting allowed origin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete allowed origin',
    });
  }
});

module.exports = router;
