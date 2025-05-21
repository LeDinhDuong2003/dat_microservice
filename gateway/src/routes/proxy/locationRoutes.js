const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('../../config/logger');
const { LOCATION_SERVICE_URL } = require('../../config/env');

const setupLocationRoutes = (app) => {
  // Proxy cho cinemas
  app.use('/api/cinemas', createProxyMiddleware({
    target: LOCATION_SERVICE_URL,
    pathRewrite: {
      '^/api/cinemas': '/cinemas'
    },
    changeOrigin: true,
    onError: (err, req, res) => {
      logger.error(`Proxy error (location service - cinemas): ${err.message}`);
      res.status(500).json({ error: 'Proxy error', message: 'Could not connect to location service' });
    }
  }));

  // Proxy cho rooms
  app.use('/api/rooms', createProxyMiddleware({
    target: LOCATION_SERVICE_URL,
    pathRewrite: {
      '^/api/rooms': '/rooms'
    },
    changeOrigin: true,
    onError: (err, req, res) => {
      logger.error(`Proxy error (location service - rooms): ${err.message}`);
      res.status(500).json({ error: 'Proxy error', message: 'Could not connect to location service' });
    }
  }));
};

module.exports = setupLocationRoutes;