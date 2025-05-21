const db = require('../db');

exports.createCinema = async (req, res) => {
  const { name, address, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO cinemas (name, address, description) VALUES ($1, $2, $3) RETURNING *',
      [name, address, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCinemas = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cinemas');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
