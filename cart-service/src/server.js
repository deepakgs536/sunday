const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const PORT = env.PORT || 3003;

app.listen(PORT, () => {
  logger.info(`Cart Service listening on port ${PORT} in ${env.NODE_ENV} mode`);
});
