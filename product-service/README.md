# Product Service

Production-ready Product Service for a serverless e-commerce backend.

## Tech Stack
- Node.js 22
- Express
- AWS Lambda (via serverless-http)
- DynamoDB
- Amazon S3
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
The server will start on port 3000 by default (or the port specified in `.env`).

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

### Product Endpoints
- `GET /products` - Get all products (Supports `?category=x&search=y&limit=10&lastEvaluatedKey=z`)
- `GET /products/:id` - Get a specific product by ID
- `POST /products` - Create a new product (Requires Auth)
- `PUT /products/:id` - Update a product (Requires Auth)
- `DELETE /products/:id` - Soft delete a product (Requires Auth)
- `POST /products/upload-url` - Generate S3 pre-signed upload URL for product images (Requires Auth)
