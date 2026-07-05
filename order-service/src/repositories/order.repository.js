const { PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../config/database');
const env = require('../config/env');

const TABLE_NAME = env.ORDER_TABLE;

class OrderRepository {
  async create(order) {
    const params = {
      TableName: TABLE_NAME,
      Item: order,
      ConditionExpression: 'attribute_not_exists(orderId)'
    };
    await documentClient.send(new PutCommand(params));
    return order;
  }

  async findById(orderId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { orderId }
    };
    const { Item } = await documentClient.send(new GetCommand(params));
    return Item;
  }

  async findByUserId(userId) {
    // In production, use a Global Secondary Index (GSI) on userId and a QueryCommand.
    // For simplicity in this local implementation without GSI definitions, we use Scan.
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

  async updateStatus(orderId, status) {
    const params = {
      TableName: TABLE_NAME,
      Key: { orderId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await documentClient.send(new UpdateCommand(params));
    return Attributes;
  }
}

module.exports = new OrderRepository();
