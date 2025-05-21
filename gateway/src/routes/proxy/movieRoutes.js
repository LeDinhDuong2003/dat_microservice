const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('../../config/logger');
const { MOVIE_SERVICE_URL } = require('../../config/env');

const movieServiceProxy = createProxyMiddleware({
  target: MOVIE_SERVICE_URL,
  pathRewrite: {
    '^/api/movies': '/movies'
  },
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error(`Proxy error (movie service): ${err.message}`);
    res.status(500).json({ error: 'Proxy error', message: 'Could not connect to movie service' });
  }
});

module.exports = (app) => {
  app.use('/api/movies', movieServiceProxy);
};