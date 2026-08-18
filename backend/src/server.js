const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`===================================================`);
    logger.info(`🚀 Winstar Backend API Server running on port ${PORT}`);
    logger.info(`🌐 Health check endpoint: http://localhost:${PORT}/api/health`);
    logger.info(`===================================================`);
});

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection Error:', err);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception Error:', err);
});
