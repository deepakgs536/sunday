# Cart Service

Production-ready Cart Service for a serverless e-commerce backend.

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
The server will start on port 3003 by default.

## Testing
```bash
npm test
```

## API Documentation

Base URL: `/api/v1`

### Authentication
Include `Authorization: Bearer <token>` in the header for all `/cart` routes.

### Health Endpoint
- `GET /health` - Check service health

### Cart Endpoints
- `GET /cart` - Get the authenticated user's cart (auto-created if not found)
- `DELETE /cart` - Clear all items from the cart
- `POST /cart/items` - Add a product to the cart (requires `productId`, `quantity`)
- `PUT /cart/items/:productId` - Update the quantity of a specific item
- `DELETE /cart/items/:productId` - Remove a specific item from the cart

## Business Rules
- Checks `inventory-service` to ensure sufficient stock is available before adding or updating items.
- Checks `product-service` to ensure the product exists.
- Automatically removes an item if its quantity is updated to `0`.
- Only allows one active cart per user.
