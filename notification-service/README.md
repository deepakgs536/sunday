# Notification Service

Production-ready Notification Service for a serverless e-commerce backend.

## Tech Stack
- Node.js 22
- Express
- AWS Lambda (via serverless-http)
- DynamoDB
- Amazon SES, SNS, SQS, EventBridge

## Architecture
Strict Clean Architecture and Repository Pattern:
`Routes -> Controllers -> Services -> Repositories -> Database`

### Provider Abstractions
- **Email:** `MOCK` (console logging) or `SES` (Amazon Simple Email Service).
- **SMS:** `MOCK` (console logging) or `SNS` (Amazon Simple Notification Service Direct Publish).

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
The server will start on port 3006 by default.

## Testing
```bash
npm test
```

## API Documentation

Base URL: `/api/v1`

### Authentication
Include `Authorization: Bearer <token>` in the header for all routes.

### Health Endpoint
- `GET /health` - Check service health

### Notification Endpoints
- `GET /notifications` - Retrieve all notifications for the authenticated user
- `GET /notifications/:notificationId` - Get a specific notification
- `POST /notifications/send` - Send a notification explicitly

## Event Consumers
This service operates heavily via Event Consumers listening to SNS/SQS/EventBridge:
- `UserRegistered` -> Welcome Email
- `OrderCreated` -> Order Confirmation
- `PaymentSucceeded` -> Payment Success Receipt
- `PaymentFailed` -> Payment Failure Alert
- `OrderCancelled` -> Order Cancellation Alert
- `PasswordChanged` -> Security Alert
