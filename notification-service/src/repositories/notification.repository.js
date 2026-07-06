const { PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../config/database');
const env = require('../config/env');

const TABLE_NAME = env.NOTIFICATION_TABLE;

class NotificationRepository {
  async create(notification) {
    const params = {
      TableName: TABLE_NAME,
      Item: notification,
      ConditionExpression: 'attribute_not_exists(notificationId)'
    };
    await documentClient.send(new PutCommand(params));
    return notification;
  }

  async findById(notificationId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { notificationId }
    };
    const { Item } = await documentClient.send(new GetCommand(params));
    return Item;
  }

  async findByUserId(userId) {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    const { Items } = await documentClient.send(new ScanCommand(params));
    return Items || [];
  }

  async updateStatus(notificationId, status) {
    const params = {
      TableName: TABLE_NAME,
      Key: { notificationId },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status },
      ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await documentClient.send(new UpdateCommand(params));
    return Attributes;
  }
}

module.exports = new NotificationRepository();
