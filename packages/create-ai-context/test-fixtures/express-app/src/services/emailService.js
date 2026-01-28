/**
 * Email Service
 */
const logger = require('../utils/logger');

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.data - Template data
 */
exports.sendEmail = async ({ to, subject, template, data }) => {
  // In production, integrate with email provider (SendGrid, SES, etc.)
  logger.info(`Email sent to ${to}: ${subject}`);

  // Placeholder implementation
  return {
    messageId: `msg_${Date.now()}`,
    to,
    subject
  };
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (user) => {
  return exports.sendEmail({
    to: user.email,
    subject: 'Welcome to Express App',
    template: 'welcome',
    data: { name: user.name }
  });
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  return exports.sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    template: 'password-reset',
    data: {
      name: user.name,
      resetToken,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    }
  });
};
