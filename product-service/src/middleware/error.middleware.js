const logger = require('../utils/logger');
const { error } = require('../utils/response');
const env = require('../config/env');
const { ZodError } = require('zod');

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  if (err.name === 'ZodError' || err.issues) {
    const formattedErrors = err.errors ? err.errors.map((e) => ({
      field: e.path ? e.path.join('.') : '',
      message: e.message
    })) : err.issues.map((e) => ({
      field: e.path ? e.path.join('.') : '',
      message: e.message
    }));
    return error(res, 400, 'Validation Error', formattedErrors);
  }

  // Handle SyntaxError (e.g. malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return error(res, 400, 'Bad Request: Malformed JSON');
  }

  // Generic Error Fallback
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  return error(res, statusCode, message);
};

module.exports = errorMiddleware;
