const db = require('../db');

exports.createSeat = async (req, res) => {
  const { room_id, name, type } = req.body;
  
  // Kiểm tra room_id có tồn tại
  try {
    const roomCheck = await db.query('SELECT id FROM rooms WHERE id = $1', [room_id]);
    
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Phòng chiếu không tồn tại' });
    }
    
    // Kiểm tra ghế đã tồn tại trong phòng chưa
    const seatCheck = await db.query('SELECT id FROM seats WHERE room_id = $1 AND name = $2', [room_id, name]);
    
    if (seatCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Ghế đã tồn tại trong phòng này' });
    }
    
    const result = await db.query(
      'INSERT INTO seats (room_id, name, type) VALUES ($1, $2, $3) RETURNING *',
      [room_id, name, type]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSeatsByRoom = async (req, res) => {
  const roomId = req.params.roomId;
  
  try {
    // Kiểm tra room_id có tồn tại
    const roomCheck = await db.query('SELECT id FROM rooms WHERE id = $1', [roomId]);
    
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Phòng chiếu không tồn tại' });
    }
    
    const result = await db.query('SELECT * FROM seats WHERE room_id = $1 ORDER BY name', [roomId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};