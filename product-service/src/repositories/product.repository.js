const { PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../config/database');
const env = require('../config/env');

const TABLE_NAME = env.PRODUCT_TABLE;

class ProductRepository {
  async create(product) {
    const params = {
      TableName: TABLE_NAME,
      Item: product,
      ConditionExpression: 'attribute_not_exists(productId)'
    };
    await documentClient.send(new PutCommand(params));
    return product;
  }

  async findById(productId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { productId }
    };
    const { Item } = await documentClient.send(new GetCommand(params));
    return Item;
  }

  async findAll({ category, search, limit = 10, lastEvaluatedKey }) {
    // Note: Using Scan is not ideal for massive tables, but sufficient for this model.
    // In a real high-scale scenario, we'd use GSI queries (e.g. indexing 'category' or using ElasticSearch for 'search').
    
    let FilterExpression = 'isDeleted = :falseVal';
    const ExpressionAttributeValues = {
      ':falseVal': false
    };
    const ExpressionAttributeNames = {};

    if (category) {
      FilterExpression += ' AND category = :category';
      ExpressionAttributeValues[':category'] = category;
    }

    if (search) {
      FilterExpression += ' AND contains(#name, :search)';
      ExpressionAttributeValues[':search'] = search;
      ExpressionAttributeNames['#name'] = 'name';
    }

    const params = {
      TableName: TABLE_NAME,
      FilterExpression,
      ExpressionAttributeValues,
      Limit: limit
    };

    if (Object.keys(ExpressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = ExpressionAttributeNames;
    }

    if (lastEvaluatedKey) {
      // In DynamoDB, lastEvaluatedKey is usually an object representing the primary key of the last item.
      // For a scan on a table with primary key `productId`, it looks like: { productId: "some-id" }
      try {
        params.ExclusiveStartKey = typeof lastEvaluatedKey === 'string' 
          ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString('ascii')) 
          : lastEvaluatedKey;
      } catch (e) {
        // Ignore invalid token
      }
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

    const params = {
      TableName: TABLE_NAME,
      Key: { productId },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(productId) AND isDeleted = :falseVal',
      ReturnValues: 'ALL_NEW'
    };

    // We add :falseVal for the condition expression but it might conflict if it's already in updateData.
    // So we prefix it safely.
    expressionAttributeValues[':condFalseVal'] = false;
    params.ConditionExpression = 'attribute_exists(productId) AND isDeleted = :condFalseVal';

    const { Attributes } = await documentClient.send(new UpdateCommand(params));
    return Attributes;
  }

  async softDelete(productId) {
    return this.update(productId, { isDeleted: true });
  }
}

module.exports = new ProductRepository();
