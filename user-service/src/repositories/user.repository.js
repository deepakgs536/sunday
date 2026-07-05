const { PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../config/database');
const env = require('../config/env');

const TABLE_NAME = env.USER_TABLE;

class UserRepository {
  async create(user) {
    const params = {
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)' // ensure no override
    };
    await documentClient.send(new PutCommand(params));
    return user;
  }

  async findById(userId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { userId }
    };
    const { Item } = await documentClient.send(new GetCommand(params));
    return Item;
  }

  async findByEmail(email) {
    // Note: Since email is not the primary key, we would typically use a Global Secondary Index (GSI)
    // For this implementation without GSI specified, we'll assume there is an 'EmailIndex' 
    // or we use a composite key pattern. Wait, without GSI, we'd have to scan, which is bad for prod.
    // We will use Query on a GSI named 'EmailIndex'.
    const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
    
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };
    
    const { Items } = await documentClient.send(new QueryCommand(params));
    return Items && Items.length > 0 ? Items[0] : null;
  }

  async update(userId, updateData) {
    // Generate update expression dynamically
    const updateExpressionParts = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    updateData.updatedAt = new Date().toISOString();

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        updateExpressionParts.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    }

    if (updateExpressionParts.length === 0) return null;

    const params = {
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes } = await documentClient.send(new UpdateCommand(params));
    return Attributes;
  }

  async softDelete(userId) {
    return this.update(userId, { isDeleted: true });
  }
}

module.exports = new UserRepository();
