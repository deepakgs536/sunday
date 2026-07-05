const { PutCommand, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../config/database');
const env = require('../config/env');

const TABLE_NAME = env.CART_TABLE;

class CartRepository {
  async create(cart) {
    const params = {
      TableName: TABLE_NAME,
      Item: cart,
      ConditionExpression: 'attribute_not_exists(userId)'
    };
    await documentClient.send(new PutCommand(params));
    return cart;
  }

  async findByUserId(userId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { userId }
    };
    const { Item } = await documentClient.send(new GetCommand(params));
    return Item;
  }

  async save(userId, cartData) {
    // Overwrite items array
    const params = {
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: 'SET items = :items, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':items': cartData.items,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await documentClient.send(new UpdateCommand(params));
    return Attributes;
  }

  async delete(userId) {
    const params = {
      TableName: TABLE_NAME,
      Key: { userId }
    };
    await documentClient.send(new DeleteCommand(params));
  }
}

module.exports = new CartRepository();
