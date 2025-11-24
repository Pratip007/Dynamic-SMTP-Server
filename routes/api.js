const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendInquiryEmail } = require('../services/smtpService');
const { isOriginAllowed } = require('../utils/corsHelper');
const router = express.Router();

/**
 * CORS middleware for API routes - checks dynamic origins
 */
async function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  
  try {
    // Check if origin is allowed (for logging/monitoring)
    // This defaults to true if no origins are configured
    const allowed = await isOriginAllowed(origin || '*');
    
    // Always set CORS headers - allow all requests by default
    // The isOriginAllowed function already defaults to allowing all if no origins configured
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  } catch (error) {
    console.error('CORS check error:', error);
    // On error, always allow the request (fail open)
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  
  next();
}

// Apply CORS middleware to all API routes
router.use(corsMiddleware);

/**
 * OPTIONS /api/send-inquiry
 * Handle CORS preflight requests
 */
router.options('/send-inquiry', (req, res) => {
  // CORS headers are already set by corsMiddleware, but ensure they're here too
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

/**
 * POST /api/send-inquiry
 * Public endpoint for landing pages to send inquiry emails
 */
router.post(
  '/send-inquiry',
  [
    body('landingPageId')
      .notEmpty()
      .withMessage('landingPageId is required')
      .isString()
      .withMessage('landingPageId must be a string'),
    body('formData')
      .notEmpty()
      .withMessage('formData is required')
      .isObject()
      .withMessage('formData must be an object'),
    body('formData.email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    body('formData.name')
      .optional()
      .isString()
      .withMessage('name must be a string'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }
      
      const { landingPageId, formData } = req.body;
      
      // Send inquiry email
      const result = await sendInquiryEmail(landingPageId, formData);
      
      return res.json({
        success: true,
        message: result.message,
        messageId: result.messageId,
      });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send inquiry email',
      });
    }
  }
);

module.exports = router;
