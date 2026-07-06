const { PublishCommand } = require('@aws-sdk/client-sns');
const { snsClient } = require('../config/aws');
const env = require('../config/env');
const logger = require('../utils/logger');

class MockSMSService {
  async sendSMS(phoneNumber, message) {
    logger.info(`[MOCK SMS] To: ${phoneNumber} | Message: ${message}`);
    return { success: true, messageId: 'mock-sms-id' };
  }
}

class SNSSMSService {
  async sendSMS(phoneNumber, message) {
    const params = {
      PhoneNumber: phoneNumber,
      Message: message
    };
    
    try {
      const command = new PublishCommand(params);
      const response = await snsClient.send(command);
      logger.info(`SMS sent via SNS to ${phoneNumber}`);
      return { success: true, messageId: response.MessageId };
    } catch (error) {
      logger.error('Failed to send SMS via SNS', { error: error.message });
      throw error;
    }
  }
}

class SMSServiceFactory {
  static getService() {
    return env.SMS_PROVIDER === 'SNS' ? new SNSSMSService() : new MockSMSService();
  }
}

module.exports = SMSServiceFactory.getService();
