const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const scheduleRoutes = require('./routes/scheduleRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use('/schedules', scheduleRoutes);

// Tạo bảng nếu chưa có
db.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      movie_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      normal_seat_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      vip_seat_price DECIMAL(10, 2) NOT NULL DEFAULT 0
    );
  `);

app.listen(port, () => {
  console.log(`Schedule service is running on port ${port}`);
});
