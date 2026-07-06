const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { SNSClient } = require('@aws-sdk/client-sns');
const { SQSClient } = require('@aws-sdk/client-sqs');
const { EventBridgeClient } = require('@aws-sdk/client-eventbridge');
const { SESClient } = require('@aws-sdk/client-ses');
const env = require('./env');

const clientConfig = {
  region: env.AWS_REGION
};

const dynamoClient = new DynamoDBClient(clientConfig);
const snsClient = new SNSClient(clientConfig);
const sqsClient = new SQSClient(clientConfig);
const eventBridgeClient = new EventBridgeClient(clientConfig);
const sesClient = new SESClient(clientConfig);

module.exports = {
  dynamoClient,
  snsClient,
  sqsClient,
  eventBridgeClient,
  sesClient
};
