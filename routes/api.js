const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendInquiryEmail } = require('../services/smtpService');
const router = express.Router();

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
      
      res.json({
        success: true,
        message: result.message,
        messageId: result.messageId,
      });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send inquiry email',
      });
    }
  }
);

module.exports = router;

