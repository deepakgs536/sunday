const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 401, 'Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  
  if (token === 'invalid-token') {
    return error(res, 401, 'Unauthorized: Invalid token');
  }

  // Extract mock userId from token or set default for testing
  req.user = {
    userId: token === 'user-123' ? 'user-123' : 'mock-user-id',
    role: 'USER'
  };

  next();
};

module.exports = {
  authMiddleware
};
