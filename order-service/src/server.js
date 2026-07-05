const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const PORT = env.PORT || 3004;

app.listen(PORT, () => {
  logger.info(`Order Service listening on port ${PORT} in ${env.NODE_ENV} mode`);
});
