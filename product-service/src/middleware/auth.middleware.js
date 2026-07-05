const { error } = require('../utils/response');

// Placeholder for actual authentication (e.g. validating a JWT)
// In a serverless architecture, this is often handled by API Gateway Authorizers.
// We provide a basic mock implementation that requires a Bearer token.
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 401, 'Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  
  // Basic mock verification (replace with actual JWT verify if not using API Gateway authorizer)
  if (token === 'invalid-token') {
    return error(res, 401, 'Unauthorized: Invalid token');
  }

  // Mock user payload
  req.user = {
    userId: 'mock-user-id',
    role: 'ADMIN' // For testing restricted operations
  };

  next();
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 403, 'Forbidden: Insufficient permissions');
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};
