const { PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../config/database');
const env = require('../config/env');

const TABLE_NAME = env.INVENTORY_TABLE;

class InventoryRepository {
  async create(inventory) {
    const params = {
      TableName: TABLE_NAME,
      Item: inventory,
      // We use productId as the primary key since it maps 1:1 with a product.
      ConditionExpression: 'attribute_not_exists(productId)'
    };
    await documentClient.send(new PutCommand(params));
    return inventory;
  }

  async findByProductId(productId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { productId }
    };
    const { Item } = await documentClient.send(new GetCommand(params));
    return Item;
  }

  async findAll({ limit = 10, lastEvaluatedKey } = {}) {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'isDeleted = :falseVal',
      ExpressionAttributeValues: { ':falseVal': false },
      Limit: limit
    };

    if (lastEvaluatedKey) {
      try {
        params.ExclusiveStartKey = typeof lastEvaluatedKey === 'string' 
          ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString('ascii')) 
          : lastEvaluatedKey;
      } catch (e) {}
    }

    const { Items, LastEvaluatedKey } = await documentClient.send(new ScanCommand(params));
    
    return {
      items: Items || [],
      nextKey: LastEvaluatedKey ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64') : null
    };
  }

  async update(productId, updateData) {
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

    expressionAttributeNames['#isDeleted'] = 'isDeleted';
    expressionAttributeValues[':condFalseVal'] = false;

    const params = {
      TableName: TABLE_NAME,
      Key: { productId },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(productId) AND (attribute_not_exists(#isDeleted) OR #isDeleted = :condFalseVal)',
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes } = await documentClient.send(new UpdateCommand(params));
    return Attributes;
  }

  async softDelete(productId) {
    return this.update(productId, { isDeleted: true });
  }
}

module.exports = new InventoryRepository();
