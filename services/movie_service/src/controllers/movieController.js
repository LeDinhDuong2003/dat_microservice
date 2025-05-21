const db = require('../db');

exports.createMovie = async (req, res) => {
  const { name, genre, label, duration, description, status, img } = req.body; // Thêm img vào
  try {
    const result = await db.query(
      'INSERT INTO movies (name, genre, label, duration, description, status, img) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, genre, label, duration, description, status, img] // Thêm img vào danh sách tham số
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM movies');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMovieById = async (req, res) => {
  const movieId = req.params.id;
  
  try {
    const result = await db.query('SELECT * FROM movies WHERE id = $1', [movieId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Phim không tồn tại' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hàm tìm kiếm phim theo tên trong movie_service
exports.searchMovies = async (req, res) => {
  const { name } = req.query;
  
  try {
    let query = 'SELECT * FROM movies';
    const params = [];
    
    if (name) {
      query += ' WHERE name ILIKE $1';
      params.push(`%${name}%`);
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};