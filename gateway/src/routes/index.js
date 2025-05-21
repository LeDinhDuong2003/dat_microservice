const healthCheckRoutes = require('./healthCheck');
const authRoutes = require('./authRoutes');
const setupMovieRoutes = require('./proxy/movieRoutes');
const setupLocationRoutes = require('./proxy/locationRoutes');
const setupScheduleRoutes = require('./proxy/scheduleRoutes');
const { authenticateToken } = require('../middleware/authMiddleware');

const setupRoutes = (app) => {
  // Route không cần xác thực
  app.use('/', healthCheckRoutes);
  app.use('/api/auth', authRoutes);
  
  // Áp dụng middleware xác thực cho tất cả API khác
  app.use('/api/movies', authenticateToken);
  app.use('/api/cinemas', authenticateToken);
  app.use('/api/rooms', authenticateToken);
  app.use('/api/schedules', authenticateToken);
  
  // Cài đặt routes proxy
  setupMovieRoutes(app);
  setupLocationRoutes(app);
  setupScheduleRoutes(app);
};

module.exports = setupRoutes;