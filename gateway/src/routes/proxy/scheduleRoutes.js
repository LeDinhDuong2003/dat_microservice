const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('../../config/logger');
const { SCHEDULE_SERVICE_URL } = require('../../config/env');

const scheduleServiceProxy = createProxyMiddleware({
  target: SCHEDULE_SERVICE_URL,
  pathRewrite: {
    '^/api/schedules': '/schedules'
  },
  changeOrigin: true,
  secure: false,
  logLevel: 'debug', // Thêm level debug để xem chi tiết
  onProxyReq: (proxyReq, req, res) => {
    // Log chi tiết request headers và body
    // logger.info(`Proxying to schedule service: ${req.method} ${req.url}`);
    // logger.info(`Headers: ${JSON.stringify(req.headers)}`);
    
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      // logger.info(`Request body: ${bodyData}`);
      
      // Thêm đoạn này nếu có vấn đề về body
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // logger.info(`Received response from schedule service: ${proxyRes.statusCode}`);
    // logger.info(`Response headers: ${JSON.stringify(proxyRes.headers)}`);
  },
  onError: (err, req, res) => {
    // logger.error(`Proxy error (schedule service): ${err.message}`);
    // logger.error(`Error stack: ${err.stack}`);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: 'Could not connect to schedule service',
      details: err.message
    });
  }
});

module.exports = (app) => {
  app.use('/api/schedules', scheduleServiceProxy);
};