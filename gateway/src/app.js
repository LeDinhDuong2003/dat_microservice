const express = require('express');
const setupCommonMiddleware = require('./middleware/common');
const setupRoutes = require('./routes');
const setupErrorHandlers = require('./middleware/errorHandler');
const logger = require('./config/logger'); // Đảm bảo dòng này tồn tại nếu sử dụng logger trong file này


const app = express();

// Cài đặt middleware chung
setupCommonMiddleware(app);

// Thêm đoạn này vào app.js trước khi áp dụng routes
app.use((req, res, next) => {
    if (req.method === 'POST') {
      // Log body để debug
      logger.info(`POST request body: ${JSON.stringify(req.body)}`);
    }
    next();
  });

// Cài đặt routes
setupRoutes(app);

// Cài đặt middleware xử lý lỗi
setupErrorHandlers(app);

module.exports = app;