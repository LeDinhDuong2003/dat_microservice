const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('../config/logger');

const setupCommonMiddleware = (app) => {
  // Cấu hình CORS
  const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
  
  app.use(cors(corsOptions));
  
  // Xử lý OPTIONS request một cách rõ ràng
  app.options('*', cors(corsOptions));
  
  // Bảo mật nhưng không can thiệp vào CORS
  app.use(helmet({
    crossOriginResourcePolicy: false
  }));
  
  // Parse JSON với limit cao hơn
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
};

module.exports = setupCommonMiddleware;