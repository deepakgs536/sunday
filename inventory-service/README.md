# Inventory Service

Production-ready Inventory Service for a serverless e-commerce backend.

## Tech Stack
- Node.js 22
- Express
- AWS Lambda (via serverless-http)
- DynamoDB
- SNS, SQS, EventBridge

## Architecture
Strict Clean Architecture and Repository Pattern:
`Routes -> Controllers -> Services -> Repositories -> Database`

## Installation
```bash
npm install
```

## Environment Variables
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

## Running Locally
```bash
npm run dev
```
The server will start on port 3002 by default.

## Testing
```bash
npm test
```

## Deployment
The service uses `serverless-http` to wrap the Express app. Point your AWS Lambda handler to `handler.handler`.

## API Documentation

Base URL: `/v1/api`

### Health Endpoint
- `GET /health` - Check service health

### Inventory Endpoints
- `GET /inventory` - Get all inventory records
- `GET /inventory/:productId` - Get inventory for a specific product
- `POST /inventory` - Create an inventory record
- `PUT /inventory/:productId` - Soft delete inventory
- `DELETE /inventory/:productId` - Soft delete inventory
- `POST /inventory/:productId/add` - Add stock (amount)
- `POST /inventory/:productId/remove` - Remove stock (amount)
- `POST /inventory/:productId/reserve` - Reserve stock (amount)
- `POST /inventory/:productId/release` - Release reserved stock (amount)

## Business Rules
- `available` quantity is dynamically calculated (`quantity - reservedQuantity`).
- Cannot remove stock if it drops below 0 or if reserved stock exceeds remaining quantity.
- Cannot reserve stock if `amount > available`.
- Listens to `ProductCreated` events to initialize inventory to 0.
