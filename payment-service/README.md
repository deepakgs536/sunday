# Payment Service

Production-ready Payment Service for a serverless e-commerce backend.

## Tech Stack
- Node.js 22
- Express
- AWS Lambda (via serverless-http)
- DynamoDB
- SNS, SQS, EventBridge

## Architecture
Strict Clean Architecture and Repository Pattern:
`Routes -> Controllers -> Services -> Repositories -> Database`

### Gateway Abstraction
The `gateway.service.js` utilizes the Factory pattern to support `MOCK`, `STRIPE`, and `RAZORPAY` gateways based on the `PAYMENT_PROVIDER` environment variable.

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
The server will start on port 3005 by default.

## Testing
```bash
npm test
```

## API Documentation

Base URL: `/api/v1`

### Authentication
Include `Authorization: Bearer <token>` in the header for all `/payments` routes except `/webhook`.

### Health Endpoint
- `GET /health` - Check service health

### Payment Endpoints
- `POST /payments` - Create a new payment record (initializes status to PENDING)
- `GET /payments/:paymentId` - Get a specific payment
- `POST /payments/verify` - Verifies a payment with the provider and transitions it to SUCCESS or FAILED
- `POST /payments/refund` - Refunds a SUCCESSFUL payment
- `POST /payments/webhook` - Standardized webhook handler that verifies payload signatures and finalizes transaction status.

## Business Rules
- All payments initially start as `PENDING`.
- Simulating `MOCK` provider skips HTTP requests and auto-yields successful mock payload assertions.
- Consumes `OrderCreated` to automatically create payments.
- Consumes `OrderCancelled` to halt further payment pipelines.
