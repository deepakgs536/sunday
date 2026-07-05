# User Service

Production-ready User Service for a serverless e-commerce backend.

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
The server will start on port 3000 by default.

## Testing
```bash
npm test
```

## Deployment
The service uses `serverless-http` to wrap the Express app. Point your AWS Lambda handler to `handler.handler`.

## API Documentation

### Auth Endpoints
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get JWT
- `GET /api/v1/auth/me` - Get current user profile (Requires JWT)

### User Endpoints (Require JWT)
- `PUT /api/v1/users/profile` - Update profile
- `PUT /api/v1/users/password` - Change password
- `DELETE /api/v1/users` - Soft delete account
- `POST /api/v1/users/upload-url` - Generate S3 pre-signed upload URL
