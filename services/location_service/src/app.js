const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const cinemaRoutes = require('./routes/cinemaRoutes');
const roomRoutes = require('./routes/roomRoutes');
const seatRoutes = require('./routes/seatRoutes');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use('/', cinemaRoutes);
app.use('/', roomRoutes);
app.use('/', seatRoutes);


// Tạo bảng nếu chưa có
db.query(`
  CREATE TABLE IF NOT EXISTS cinemas (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT
  );
`);

// Thêm vào app.js sau phần tạo bảng cinemas
db.query(`
  CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    cinema_id INTEGER REFERENCES cinemas(id),
    name TEXT NOT NULL,
    seats INTEGER NOT NULL,
    description TEXT,
    type TEXT NOT NULL
  );
`);

// Thêm vào app.js sau phần tạo bảng rooms
db.query(`
  CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL
  );
`);

app.listen(port, () => {
  console.log(`location service is running on port ${port}`);
});
