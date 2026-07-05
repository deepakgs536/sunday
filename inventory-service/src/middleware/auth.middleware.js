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

  req.user = {
    userId: 'mock-user-id',
    role: 'ADMIN'
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
