const db = require('../db');

exports.createRoom = async (req, res) => {
  const { cinema_id, name, seats, description, type } = req.body;
  
  // Kiểm tra cinema_id có tồn tại
  try {
    const cinemaCheck = await db.query('SELECT id FROM cinemas WHERE id = $1', [cinema_id]);
    
    if (cinemaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Rạp chiếu phim không tồn tại' });
    }
    
    const result = await db.query(
      'INSERT INTO rooms (cinema_id, name, seats, description, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cinema_id, name, seats, description, type]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomsByCinema = async (req, res) => {
  const cinemaId = req.params.cinemaId;
  
  try {
    // Kiểm tra cinema_id có tồn tại
    const cinemaCheck = await db.query('SELECT id FROM cinemas WHERE id = $1', [cinemaId]);
    
    if (cinemaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Rạp chiếu phim không tồn tại' });
    }
    
    const result = await db.query('SELECT * FROM rooms WHERE cinema_id = $1', [cinemaId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomById = async (req, res) => {
    const roomId = req.params.id;
    
    try {
      // Sử dụng JOIN để lấy thông tin phòng và rạp
      const result = await db.query(
        `SELECT 
          r.id, r.name, r.seats, r.description, r.type, r.cinema_id,
          c.name as cinema_name, c.address as cinema_address, c.description as cinema_description
        FROM rooms r
        JOIN cinemas c ON r.cinema_id = c.id
        WHERE r.id = $1`, 
        [roomId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Phòng chiếu không tồn tại' });
      }
      
      // Định dạng lại dữ liệu để trả về
      const room = result.rows[0];
      const response = {
        id: room.id,
        name: room.name,
        seats: room.seats,
        description: room.description,
        type: room.type,
        cinema: {
          id: room.cinema_id,
          name: room.cinema_name,
          address: room.cinema_address,
          description: room.cinema_description
        }
      };
      
      res.json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };