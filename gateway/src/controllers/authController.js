const jwt = require('jsonwebtoken');
const { SECRET_KEY, TOKEN_EXPIRATION } = require('../config/auth');
const logger = require('../config/logger');

// Thông tin đăng nhập cố định theo yêu cầu
const validCredentials = {
  username: 'dat',
  password: '123'
};

const login = (req, res) => {
  const { username, password } = req.body;

  // Kiểm tra thông tin đăng nhập
  if (username !== validCredentials.username || password !== validCredentials.password) {
    logger.warn(`Failed login attempt for user: ${username}`);
    return res.status(401).json({ error: 'Authentication failed', message: 'Invalid username or password' });
  }

  // Tạo JWT token
  const user = { username };
  const token = jwt.sign(user, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });

  logger.info(`User ${username} successfully logged in`);
  res.json({
    message: 'Authentication successful',
    token,
    user: { username }
  });
};

module.exports = {
  login
};