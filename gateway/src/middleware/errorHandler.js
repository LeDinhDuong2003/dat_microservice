const logger = require('../config/logger');

const errorHandler = (app) => {
  // Middleware xử lý lỗi chi tiết hơn
  app.use((err, req, res, next) => {
    console.error('Error details:', err);
    logger.error(`Error: ${err.message}`);
    logger.error(`Stack trace: ${err.stack}`);
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message
    });
  });

  // Xử lý route không tồn tại
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'The requested endpoint does not exist' });
  });
};

module.exports = errorHandler;