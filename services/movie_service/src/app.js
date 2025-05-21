require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Khởi tạo bảng nếu chưa có
db.query(`
  CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    img TEXT NOT NULL,
    genre TEXT,
    label TEXT,
    duration INTEGER,
    description TEXT,
    status TEXT
  );
`);

app.use('/movies', movieRoutes);

app.listen(port, () => {
  console.log(`Movie service is running on port ${port}`);
});
