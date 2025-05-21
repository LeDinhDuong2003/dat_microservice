const app = require('./app');
const http = require('http');
const logger = require('./config/logger');
const { PORT } = require('./config/env');

const server = http.createServer(app);

// Cấu hình timeout dài hơn
server.timeout = 120000; // 2 phút

const startServer = () => {
  server.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`);
    console.log(`API Gateway is running on port ${PORT}`);
  });
};

// Xử lý lỗi server
server.on('error', (error) => {
  logger.error(`Server error: ${error.message}`);
  console.error('Server error:', error);
});

startServer();

// Xử lý tắt app gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});