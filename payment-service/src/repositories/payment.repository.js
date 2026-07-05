const { PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../config/database');
const env = require('../config/env');

const TABLE_NAME = env.PAYMENT_TABLE;

class PaymentRepository {
  async create(payment) {
    const params = {
      TableName: TABLE_NAME,
      Item: payment,
      ConditionExpression: 'attribute_not_exists(paymentId)'
    };
    await documentClient.send(new PutCommand(params));
    return payment;
  }

  async findById(paymentId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { paymentId }
    };
    const { Item } = await documentClient.send(new GetCommand(params));
    return Item;
  }

  async updateStatus(paymentId, status, additionalData = {}) {
    let updateExpression = 'SET #status = :status, updatedAt = :updatedAt';
    const expressionAttributeNames = { '#status': 'status' };
    const expressionAttributeValues = {
      ':status': status,
      ':updatedAt': new Date().toISOString()
    };

    if (additionalData.transactionId) {
      updateExpression += ', transactionId = :transactionId';
      expressionAttributeValues[':transactionId'] = additionalData.transactionId;
    }

    const params = {
      TableName: TABLE_NAME,
      Key: { paymentId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await documentClient.send(new UpdateCommand(params));
    return Attributes;
  }
}

module.exports = new PaymentRepository();
