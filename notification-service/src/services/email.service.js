const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { sesClient } = require('../config/aws');
const env = require('../config/env');
const logger = require('../utils/logger');

class MockEmailService {
  async sendEmail(to, subject, body) {
    logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    logger.info(`[MOCK EMAIL] Body: ${body}`);
    return { success: true, messageId: 'mock-email-id' };
  }
}

class SESEmailService {
  async sendEmail(to, subject, body) {
    if (!env.SES_FROM_EMAIL) {
      throw new Error('SES_FROM_EMAIL is required for SES provider');
    }
    
    const params = {
      Source: env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } }
      }
    };
    
    try {
      const command = new SendEmailCommand(params);
      const response = await sesClient.send(command);
      logger.info(`Email sent via SES to ${to}`);
      return { success: true, messageId: response.MessageId };
    } catch (error) {
      logger.error('Failed to send email via SES', { error: error.message });
      throw error;
    }
  }
}

class EmailServiceFactory {
  static getService() {
    return env.EMAIL_PROVIDER === 'SES' ? new SESEmailService() : new MockEmailService();
  }
}

module.exports = EmailServiceFactory.getService();
