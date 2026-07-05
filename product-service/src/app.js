const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const loggerMiddleware = require('./middleware/logger.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const healthRoutes = require('./routes/health.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(loggerMiddleware);

// API Routes
// Note: using /v1/api based on explicit request.
const API_PREFIX = '/v1/api';

app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
