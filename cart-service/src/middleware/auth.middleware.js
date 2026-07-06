const { error } = require('../utils/response');
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 401, 'Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  
  try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

      req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
      };

      next();

  } catch (err) {
      return error(res, 401, "Unauthorized: Invalid or expired token");
  }

  next();
};

module.exports = {
  authMiddleware
};
