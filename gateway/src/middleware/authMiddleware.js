const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const { SECRET_KEY } = require('../config/auth');

const authenticateToken = (req, res, next) => {
  // Lấy token từ header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication token is required' });
  }

  // Xác thực token
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      logger.error(`Authentication error: ${err.message}`);
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken
};