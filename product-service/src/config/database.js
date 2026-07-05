const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { dynamoClient } = require('./aws');

const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
  convertClassInstanceToMap: false
};

const unmarshallOptions = {
  wrapNumbers: false
};

const documentClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions,
  unmarshallOptions
});

module.exports = {
  documentClient
};
