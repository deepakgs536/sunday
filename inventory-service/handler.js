const serverless = require("serverless-http");
const app = require("./src/app");
const inventoryConsumer = require("./src/consumers/inventory.consumer");

const expressHandler = serverless(app);

exports.handler = async (event, context) => {

    // SQS Event
    if (event.Records && event.Records[0].eventSource === "aws:sqs") {

        for (const record of event.Records) {

            const snsEnvelope = JSON.parse(record.body);
            const message = JSON.parse(snsEnvelope.Message);

            await inventoryConsumer.handle(message);
        }

        return {
            statusCode: 200
        };
    }

    // HTTP Event
    return expressHandler(event, context);
};