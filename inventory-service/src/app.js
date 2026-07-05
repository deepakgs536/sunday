const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const loggerMiddleware = require('./middleware/logger.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const healthRoutes = require('./routes/health.routes');
const inventoryRoutes = require('./routes/inventory.routes');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(loggerMiddleware);

const API_PREFIX = '/v1/api';

app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorMiddleware);

module.exports = app;
