const db = require('../db');
const axios = require('axios');
const { publishEvent } = require('../utils/rabbitMQ');

// Hằng số URL của movie_service
// const MOVIE_SERVICE_URL = 'http://movie_service:3000'; // URL trong mạng Docker
// const LOCATION_SERVICE_URL = 'http://location_service:3001'; // URL trong mạng Docker

const MOVIE_SERVICE_URL = 'http://movie-service:3000'; // Sử dụng dấu gạch ngang
const LOCATION_SERVICE_URL = 'http://location-service:3001'; // Sử dụng dấu gạch ngang


/**
 * Tạo lịch chiếu mới
 */
exports.createSchedule = async (req, res) => {
  const { movie_id, room_id, start_time, end_time, normal_seat_price, vip_seat_price } = req.body;
  try {
    // Tạo lịch chiếu mới trong cơ sở dữ liệu
    const result = await db.query(
      'INSERT INTO schedules (movie_id, room_id, start_time, end_time, normal_seat_price, vip_seat_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [movie_id, room_id, start_time, end_time, normal_seat_price, vip_seat_price]
    );
    
    const newSchedule = result.rows[0];
    
    // Lấy thông tin chi tiết của lịch chiếu mới
    try {
      const scheduleDetails = await getScheduleDetails(newSchedule.id);
      
      // Phát sự kiện lịch chiếu được tạo với thông tin đầy đủ
      await publishEvent('schedule.created', scheduleDetails);
      
      // Trả về kết quả cho client
      res.status(201).json(newSchedule);
    } catch (detailError) {
      console.error(`Error getting schedule details: ${detailError.message}`);
      
      // Vẫn phát sự kiện với thông tin cơ bản nếu không lấy được chi tiết
      await publishEvent('schedule.created', newSchedule);
      
      res.status(201).json(newSchedule);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM schedules');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSchedulesWithMovieDetails = async (req, res) => {
    try {
      // Lấy tất cả lịch chiếu
      const schedulesResult = await db.query('SELECT * FROM schedules');
      const schedules = schedulesResult.rows;
      
      // Tạo mảng kết quả để trả về
      const schedulesWithDetails = [];
      
      // Duyệt qua từng lịch chiếu và lấy thông tin phim và phòng tương ứng
      for (const schedule of schedules) {
        try {
          // Tạo promise để gọi các API đồng thời
          const [movieResponse, roomResponse] = await Promise.all([
            axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`),
            axios.get(`${LOCATION_SERVICE_URL}/rooms/${schedule.room_id}`)
          ]);
          
          const movieDetails = movieResponse.data;
          const roomDetails = roomResponse.data;
          
          // Kết hợp thông tin lịch chiếu, phim và phòng
          schedulesWithDetails.push({
            schedule_id: schedule.id,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            normal_seat_price: schedule.normal_seat_price,
            vip_seat_price: schedule.vip_seat_price,
            movie: movieDetails,
            room: roomDetails
          });
        } catch (error) {
          // Xử lý lỗi và vẫn trả về lịch chiếu với thông tin có sẵn
          const scheduleInfo = {
            schedule_id: schedule.id,
            room_id: schedule.room_id,
            movie_id: schedule.movie_id,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            normal_seat_price: schedule.normal_seat_price,
            vip_seat_price: schedule.vip_seat_price
          };
          
          // Kiểm tra xem lỗi đến từ đâu
          if (error.config && error.config.url.includes('movies')) {
            scheduleInfo.movie = { error: 'Không thể lấy thông tin phim' };
            
            // Vẫn cố gắng lấy thông tin phòng
            try {
              const roomResponse = await axios.get(`${LOCATION_SERVICE_URL}/rooms/${schedule.room_id}`);
              scheduleInfo.room = roomResponse.data;
            } catch (roomErr) {
              scheduleInfo.room = { error: 'Không thể lấy thông tin phòng chiếu' };
            }
          } else if (error.config && error.config.url.includes('rooms')) {
            scheduleInfo.room = { error: 'Không thể lấy thông tin phòng chiếu' };
            
            // Vẫn cố gắng lấy thông tin phim
            try {
              const movieResponse = await axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`);
              scheduleInfo.movie = movieResponse.data;
            } catch (movieErr) {
              scheduleInfo.movie = { error: 'Không thể lấy thông tin phim' };
            }
          } else {
            scheduleInfo.movie = { error: 'Không thể lấy thông tin phim' };
            scheduleInfo.room = { error: 'Không thể lấy thông tin phòng chiếu' };
          }
          
          schedulesWithDetails.push(scheduleInfo);
        }
      }
      
      res.json(schedulesWithDetails);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};
  

// Cập nhật hàm lấy chi tiết một lịch chiếu
exports.getScheduleWithMovieDetails = async (req, res) => {
    const scheduleId = req.params.id;
    
    try {
      // Lấy thông tin lịch chiếu
      const scheduleResult = await db.query('SELECT * FROM schedules WHERE id = $1', [scheduleId]);
      
      if (scheduleResult.rows.length === 0) {
        return res.status(404).json({ error: 'Lịch chiếu không tồn tại' });
      }
      
      const schedule = scheduleResult.rows[0];
      
      try {
        // Gọi API đồng thời để lấy thông tin phim và phòng
        const [movieResponse, roomResponse] = await Promise.all([
          axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`),
          axios.get(`${LOCATION_SERVICE_URL}/rooms/${schedule.room_id}`)
        ]);
        
        const movieDetails = movieResponse.data;
        const roomDetails = roomResponse.data;
        
        // Kết hợp thông tin lịch chiếu, phim và phòng
        const result = {
          schedule_id: schedule.id,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          normal_seat_price: schedule.normal_seat_price,
          vip_seat_price: schedule.vip_seat_price,
          movie: movieDetails,
          room: roomDetails
        };
        
        res.json(result);
      } catch (error) {
        // Xử lý lỗi chi tiết hơn
        const result = {
          ...schedule
        };
        
        // Kiểm tra xem lỗi đến từ đâu
        if (error.config && error.config.url.includes('movies')) {
          result.movie = { error: 'Không thể lấy thông tin phim' };
          
          // Vẫn cố gắng lấy thông tin phòng
          try {
            const roomResponse = await axios.get(`${LOCATION_SERVICE_URL}/rooms/${schedule.room_id}`);
            result.room = roomResponse.data;
          } catch (roomErr) {
            result.room = { error: 'Không thể lấy thông tin phòng chiếu' };
          }
        } else if (error.config && error.config.url.includes('rooms')) {
          result.room = { error: 'Không thể lấy thông tin phòng chiếu' };
          
          // Vẫn cố gắng lấy thông tin phim
          try {
            const movieResponse = await axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`);
            result.movie = movieResponse.data;
          } catch (movieErr) {
            result.movie = { error: 'Không thể lấy thông tin phim' };
          }
        } else {
          result.movie = { error: 'Không thể lấy thông tin phim' };
          result.room = { error: 'Không thể lấy thông tin phòng chiếu' };
        }
        
        res.json(result);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};


// Thêm vào cuối file scheduleController.js

/**
 * Cập nhật lịch chiếu
 */
exports.updateSchedule = async (req, res) => {
  const scheduleId = req.params.id;
  const { movie_id, room_id, start_time, end_time, normal_seat_price, vip_seat_price } = req.body;
  
  try {
    // Kiểm tra lịch chiếu tồn tại không
    const checkSchedule = await db.query('SELECT * FROM schedules WHERE id = $1', [scheduleId]);
    
    if (checkSchedule.rows.length === 0) {
      return res.status(404).json({ error: 'Lịch chiếu không tồn tại' });
    }
    
    // Cập nhật thông tin lịch chiếu
    const result = await db.query(
      `UPDATE schedules 
       SET movie_id = $1, room_id = $2, start_time = $3, end_time = $4, 
           normal_seat_price = $5, vip_seat_price = $6
       WHERE id = $7 
       RETURNING *`,
      [movie_id, room_id, start_time, end_time, normal_seat_price, vip_seat_price, scheduleId]
    );
    
    const updatedSchedule = result.rows[0];
    
    // Lấy thông tin chi tiết của lịch chiếu sau khi cập nhật
    try {
      const scheduleDetails = await getScheduleDetails(updatedSchedule.id);

      console.log('Data before sending:', JSON.stringify(scheduleDetails));

      
      // Phát sự kiện lịch chiếu được cập nhật với thông tin đầy đủ
      await publishEvent('schedule.updated', scheduleDetails);
      
      res.json(updatedSchedule);
    } catch (detailError) {
      console.error(`Error getting schedule details after update: ${detailError.message}`);
      
      // Vẫn phát sự kiện với thông tin cơ bản nếu không lấy được chi tiết
      await publishEvent('schedule.updated', updatedSchedule);
      
      res.json(updatedSchedule);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
  
/**
 * Xóa lịch chiếu
 */
exports.deleteSchedule = async (req, res) => {
  const scheduleId = req.params.id;
  
  try {
    // Kiểm tra lịch chiếu tồn tại không
    const checkSchedule = await db.query('SELECT * FROM schedules WHERE id = $1', [scheduleId]);
    
    if (checkSchedule.rows.length === 0) {
      return res.status(404).json({ error: 'Lịch chiếu không tồn tại' });
    }
    
    const scheduleToDelete = checkSchedule.rows[0];
    
    // Lấy thông tin chi tiết trước khi xóa
    try {
      const scheduleDetails = await getScheduleDetails(scheduleId);
      
      // Xóa lịch chiếu sau khi đã lấy thông tin
      await db.query('DELETE FROM schedules WHERE id = $1', [scheduleId]);
      
      // Phát sự kiện lịch chiếu đã bị xóa với thông tin đầy đủ
      await publishEvent('schedule.deleted', scheduleDetails);
      
      res.status(200).json({ message: 'Lịch chiếu đã được xóa thành công' });
    } catch (detailError) {
      console.error(`Error getting schedule details before delete: ${detailError.message}`);
      
      // Xóa lịch chiếu nếu không lấy được chi tiết
      await db.query('DELETE FROM schedules WHERE id = $1', [scheduleId]);
      
      // Phát sự kiện với OBJECT có thuộc tính ID, không phải chỉ ID
      await publishEvent('schedule.deleted', { 
        id: parseInt(scheduleId),
        movie_id: scheduleToDelete.movie_id,
        room_id: scheduleToDelete.room_id
      });
      
      res.status(200).json({ message: 'Lịch chiếu đã được xóa thành công' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/**
 * Lấy thông tin chi tiết của lịch chiếu bao gồm phim và phòng
 */
async function getScheduleDetails(scheduleId) {
  try {
    // Lấy thông tin lịch chiếu
    const scheduleResult = await db.query('SELECT * FROM schedules WHERE id = $1', [scheduleId]);
    
    if (scheduleResult.rows.length === 0) {
      throw new Error('Lịch chiếu không tồn tại');
    }
    
    const schedule = scheduleResult.rows[0];
    
    // Gọi API đồng thời để lấy thông tin phim và phòng
    const [movieResponse, roomResponse] = await Promise.all([
      axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`),
      axios.get(`${LOCATION_SERVICE_URL}/rooms/${schedule.room_id}`)
    ]);
    
    const movieDetails = movieResponse.data;
    const roomDetails = roomResponse.data;
    
    // Kết hợp tất cả thông tin
    return {
      schedule_id: schedule.id,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      normal_seat_price: schedule.normal_seat_price,
      vip_seat_price: schedule.vip_seat_price,
      movie: movieDetails,
      room: roomDetails
    };
  } catch (error) {
    console.error(`Error fetching schedule details: ${error.message}`);
    throw error;
  }
}

/**
 * Lấy chi tiết lịch chiếu theo ID (bao gồm thông tin phim, phòng và rạp)
 */
exports.getScheduleById = async (req, res) => {
  const scheduleId = req.params.id;
  
  try {
    // Kiểm tra định dạng ID lịch chiếu
    if (!scheduleId || isNaN(parseInt(scheduleId))) {
      return res.status(400).json({ error: 'ID lịch chiếu không hợp lệ' });
    }
    
    // Lấy thông tin lịch chiếu
    const result = await db.query('SELECT * FROM schedules WHERE id = $1', [scheduleId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lịch chiếu không tồn tại' });
    }
    
    const schedule = result.rows[0];
    
    try {
      // Gọi API đồng thời để lấy thông tin phim và phòng
      const [movieResponse, roomResponse] = await Promise.all([
        axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`),
        axios.get(`${LOCATION_SERVICE_URL}/rooms/${schedule.room_id}`)
      ]);
      
      const movieDetails = movieResponse.data;
      const roomDetails = roomResponse.data;
      
      // Kết hợp tất cả thông tin
      const fullScheduleDetails = {
        schedule_id: schedule.id,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        normal_seat_price: schedule.normal_seat_price,
        vip_seat_price: schedule.vip_seat_price,
        movie: movieDetails,
        room: roomDetails
      };
      
      res.json(fullScheduleDetails);
    } catch (error) {
      console.error('Error fetching related details:', error);
      
      // Xác định lỗi cụ thể để xử lý riêng
      if (error.config && error.config.url.includes('movies')) {
        // Lỗi khi lấy thông tin phim
        // Vẫn cố gắng lấy thông tin phòng
        try {
          const roomResponse = await axios.get(`${LOCATION_SERVICE_URL}/rooms/${schedule.room_id}`);
          
          res.json({
            schedule_id: schedule.id,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            normal_seat_price: schedule.normal_seat_price,
            vip_seat_price: schedule.vip_seat_price,
            movie: { error: 'Không thể lấy thông tin phim', movie_id: schedule.movie_id },
            room: roomResponse.data
          });
        } catch (roomErr) {
          // Nếu cả hai đều lỗi, trả về thông tin cơ bản
          res.json({
            ...schedule,
            movie: { error: 'Không thể lấy thông tin phim', movie_id: schedule.movie_id },
            room: { error: 'Không thể lấy thông tin phòng chiếu', room_id: schedule.room_id }
          });
        }
      } else if (error.config && error.config.url.includes('rooms')) {
        // Lỗi khi lấy thông tin phòng
        // Vẫn cố gắng lấy thông tin phim
        try {
          const movieResponse = await axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`);
          
          res.json({
            schedule_id: schedule.id,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            normal_seat_price: schedule.normal_seat_price,
            vip_seat_price: schedule.vip_seat_price,
            movie: movieResponse.data,
            room: { error: 'Không thể lấy thông tin phòng chiếu', room_id: schedule.room_id }
          });
        } catch (movieErr) {
          // Nếu cả hai đều lỗi, trả về thông tin cơ bản
          res.json({
            ...schedule,
            movie: { error: 'Không thể lấy thông tin phim', movie_id: schedule.movie_id },
            room: { error: 'Không thể lấy thông tin phòng chiếu', room_id: schedule.room_id }
          });
        }
      } else {
        // Lỗi khác
        res.json({
          ...schedule,
          movie: { error: 'Không thể lấy thông tin phim', movie_id: schedule.movie_id },
          room: { error: 'Không thể lấy thông tin phòng chiếu', room_id: schedule.room_id }
        });
      }
    }
  } catch (err) {
    console.error('Error in getScheduleById:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy danh sách lịch chiếu phim có phân trang và lọc
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFilteredSchedules = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    // Lấy các tham số lọc từ query
    const movieName = req.query.movie_name;
    const cinemaId = req.query.cinema_id;
    
    // Xây dựng câu query cơ bản
    let queryParams = [];
    let whereConditions = [];
    let queryStr = 'SELECT * FROM schedules';
    
    // Tạo mảng để lưu các phim ID và phòng ID phù hợp
    let validMovieIds = [];
    let validRoomIds = [];
    
    // Lọc theo tên phim (nếu có)
    if (movieName) {
      try {
        // Gọi API từ movie_service để lấy các phim có tên tương tự
        const movieResponse = await axios.get(`${MOVIE_SERVICE_URL}/movies?name=${encodeURIComponent(movieName)}`);
        if (movieResponse.data && movieResponse.data.length > 0) {
          validMovieIds = movieResponse.data.map(movie => movie.id);
          
          if (validMovieIds.length > 0) {
            whereConditions.push(`movie_id IN (${validMovieIds.map((_, idx) => `$${queryParams.length + idx + 1}`).join(',')})`);
            queryParams = [...queryParams, ...validMovieIds];
          } else {
            // Nếu không tìm thấy phim nào phù hợp, trả về kết quả rỗng ngay
            return res.json({
              data: [],
              pagination: {
                total: 0,
                page,
                limit,
                totalPages: 0
              }
            });
          }
        } else {
          // Nếu không tìm thấy phim nào phù hợp, trả về kết quả rỗng ngay
          return res.json({
            data: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 0
            }
          });
        }
      } catch (error) {
        console.error("Error fetching movies by name:", error.message);
        // Tiếp tục mà không lọc theo tên phim
      }
    }
    
    // Lọc theo ID rạp (nếu có)
    if (cinemaId) {
      try {
        // Gọi API từ location_service để lấy tất cả phòng của rạp
        const roomsResponse = await axios.get(`${LOCATION_SERVICE_URL}/cinemas/${cinemaId}/rooms`);
        if (roomsResponse.data && roomsResponse.data.length > 0) {
          validRoomIds = roomsResponse.data.map(room => room.id);
          
          if (validRoomIds.length > 0) {
            whereConditions.push(`room_id IN (${validRoomIds.map((_, idx) => `$${queryParams.length + idx + 1}`).join(',')})`);
            queryParams = [...queryParams, ...validRoomIds];
          } else {
            // Nếu không tìm thấy phòng nào thuộc rạp, trả về kết quả rỗng ngay
            return res.json({
              data: [],
              pagination: {
                total: 0,
                page,
                limit,
                totalPages: 0
              }
            });
          }
        } else {
          // Nếu không tìm thấy phòng nào thuộc rạp, trả về kết quả rỗng ngay
          return res.json({
            data: [],
            pagination: {
              total: 0,
              page, 
              limit,
              totalPages: 0
            }
          });
        }
      } catch (error) {
        console.error("Error fetching rooms by cinema ID:", error.message);
        // Tiếp tục mà không lọc theo rạp
      }
    }
    
    // Nếu có điều kiện lọc, thêm vào câu query
    if (whereConditions.length > 0) {
      queryStr += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Đếm tổng số lịch chiếu thỏa mãn điều kiện
    const countQuery = `SELECT COUNT(*) as total FROM (${queryStr}) AS filtered_schedules`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Thêm phân trang vào câu query
    queryStr += ` ORDER BY start_time DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Thực hiện query lấy dữ liệu
    const result = await db.query(queryStr, queryParams);
    
    // Tính số trang
    const totalPages = Math.ceil(total / limit);
    
    // Tạo kết quả chi tiết với thông tin về phim và phòng
    const schedulesWithDetails = [];
    for (const schedule of result.rows) {
      try {
        // Gọi API đồng thời để lấy thông tin phim và phòng
        const [movieResponse, roomResponse] = await Promise.all([
          axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`),
          axios.get(`${LOCATION_SERVICE_URL}/rooms/${schedule.room_id}`)
        ]);
        
        const movieDetails = movieResponse.data;
        const roomDetails = roomResponse.data;
        
        // Kết hợp thông tin lịch chiếu, phim và phòng
        schedulesWithDetails.push({
          schedule_id: schedule.id,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          normal_seat_price: schedule.normal_seat_price,
          vip_seat_price: schedule.vip_seat_price,
          movie: movieDetails,
          room: roomDetails
        });
      } catch (error) {
        // Nếu không lấy được chi tiết, vẫn trả về thông tin cơ bản
        schedulesWithDetails.push({
          ...schedule,
          movie: { error: 'Không thể lấy thông tin phim' },
          room: { error: 'Không thể lấy thông tin phòng chiếu' }
        });
      }
    }
    
    // Trả về kết quả kèm thông tin phân trang
    res.json({
      data: schedulesWithDetails,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (err) {
    console.error("Error in getFilteredSchedules:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy danh sách lịch chiếu theo ID phòng
 */
exports.getSchedulesByRoomId = async (req, res) => {
  const roomId = req.params.roomId;
  
  try {
    // Kiểm tra định dạng ID phòng
    if (!roomId || isNaN(parseInt(roomId))) {
      return res.status(400).json({ error: 'ID phòng không hợp lệ' });
    }
    
    // Lấy tất cả lịch chiếu của phòng
    const schedulesResult = await db.query(
      'SELECT * FROM schedules WHERE room_id = $1 ORDER BY start_time ASC', 
      [roomId]
    );
    
    const schedules = schedulesResult.rows;
    
    // Nếu không có lịch chiếu nào, trả về mảng trống
    if (schedules.length === 0) {
      return res.json([]);
    }
    
    // Lấy thông tin chi tiết cho từng lịch chiếu
    const schedulesWithDetails = [];
    
    for (const schedule of schedules) {
      try {
        // Gọi API đến movie_service để lấy thông tin phim
        const movieResponse = await axios.get(`${MOVIE_SERVICE_URL}/movies/${schedule.movie_id}`);
        const movieDetails = movieResponse.data;
        
        // Kết hợp thông tin lịch chiếu và phim
        schedulesWithDetails.push({
          schedule_id: schedule.id,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          normal_seat_price: schedule.normal_seat_price,
          vip_seat_price: schedule.vip_seat_price,
          movie: movieDetails
        });
      } catch (movieErr) {
        // Nếu không lấy được thông tin phim, vẫn trả về lịch chiếu
        schedulesWithDetails.push({
          ...schedule,
          movie: { error: 'Không thể lấy thông tin phim' }
        });
      }
    }
    
    res.json(schedulesWithDetails);
  } catch (err) {
    console.error('Error in getSchedulesByRoomId:', err);
    res.status(500).json({ error: err.message });
  }
};