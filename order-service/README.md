# Order Service

Production-ready Order Service for a serverless e-commerce backend.

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
The server will start on port 3004 by default.

## Testing
```bash
npm test
```

## API Documentation

Base URL: `/api/v1`

### Authentication
Include `Authorization: Bearer <token>` in the header for all `/orders` routes.

### Health Endpoint
- `GET /health` - Check service health

### Order Endpoints
- `GET /orders` - Get all orders for the authenticated user
- `GET /orders/:orderId` - Get a specific order
- `POST /orders` - Create a new order from the user's cart
- `PUT /orders/:orderId/cancel` - Cancel a PENDING or PAYMENT_PENDING order
- `PATCH /orders/:orderId/status` - Internally update the status of an order

## Business Rules
- Creating an order pulls cart items, computes totals, initiates PENDING status, and emits events.
- Carts are cleared immediately after a successful order generation via the mocked `cart.client.js`.
- Statuses can naturally pivot via consumed events: `PaymentSucceeded`, `PaymentFailed`, `StockReserved`, `StockReservationFailed`.
- Orders can only be cancelled manually if they haven't progressed beyond payment pending.
