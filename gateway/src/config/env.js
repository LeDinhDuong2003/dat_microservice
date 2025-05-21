const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 3003,
  MOVIE_SERVICE_URL: process.env.MOVIE_SERVICE_URL || 'http://movie_service:3000',
  LOCATION_SERVICE_URL: process.env.LOCATION_SERVICE_URL || 'http://location_service:3001',
  SCHEDULE_SERVICE_URL: process.env.SCHEDULE_SERVICE_URL || 'http://schedule_service:3002'
};