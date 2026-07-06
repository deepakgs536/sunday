const { PublishCommand } = require('@aws-sdk/client-sns');
const { SendMessageCommand } = require('@aws-sdk/client-sqs');
const { PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const { snsClient, sqsClient, eventBridgeClient } = require('../config/aws');
const env = require('../config/env');
const logger = require('../utils/logger');
const crypto = require('crypto');

class EventService {
  async publish(eventType, data) {
    const provider = env.EVENT_PROVIDER;
    
    if (provider === 'NONE') {
      logger.info(`Event ${eventType} skipped as provider is NONE`);
      return;
    }

    const payload = {
      eventId: crypto.randomUUID(),
      eventType,
      timestamp: new Date().toISOString(),
      source: 'notification-service',
      data
    };

    try {
      if (provider === 'SNS') {
        await this._publishSNS(payload);
      } else if (provider === 'SQS') {
        await this._publishSQS(payload);
      } else if (provider === 'EVENTBRIDGE') {
        await this._publishEventBridge(payload);
      }
      logger.info(`Successfully published event ${eventType} via ${provider}`);
    } catch (error) {
      logger.error(`Failed to publish event ${eventType} via ${provider}`, { error: error.message });
    }
  }

  async _publishSNS(payload) {
    if (!env.SNS_TOPIC_ARN) throw new Error('SNS_TOPIC_ARN is missing');
    const command = new PublishCommand({
      TopicArn: env.SNS_TOPIC_ARN,
      Message: JSON.stringify(payload),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: payload.eventType
        }
      }
    });
    await snsClient.send(command);
  }

  async _publishSQS(payload) {
    if (!env.QUEUE_URL) throw new Error('QUEUE_URL is missing');
    const params = {
      QueueUrl: env.QUEUE_URL,
      MessageBody: JSON.stringify(payload)
    };
    if (env.QUEUE_URL.endsWith('.fifo')) {
      params.MessageGroupId = payload.eventType;
      params.MessageDeduplicationId = payload.eventId;
    }
    
    const command = new SendMessageCommand(params);
    await sqsClient.send(command);
  }

  async _publishEventBridge(payload) {
    if (!env.EVENT_BUS_NAME) throw new Error('EVENT_BUS_NAME is missing');
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName: env.EVENT_BUS_NAME,
          Source: payload.source,
          DetailType: payload.eventType,
          Detail: JSON.stringify(payload.data),
          Time: new Date(payload.timestamp)
        }
      ]
    });
    await eventBridgeClient.send(command);
  }
}

module.exports = new EventService();
