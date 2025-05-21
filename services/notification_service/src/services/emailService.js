const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Tạo transporter cho Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Gửi email thông báo
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung text
 * @param {string} html - Nội dung HTML (tùy chọn)
 */
async function sendEmail(subject, text, html) {
  try {
    const mailOptions = {
      from: `Cinema App <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
}

/**
 * Tạo HTML template hiển thị thông tin chi tiết
 * @param {Object} scheduleData - Dữ liệu lịch chiếu
 * @param {string} action - Hành động ('create' hoặc 'update')
 */
function createDetailedTemplate(scheduleData, action) {
  const movie = scheduleData.movie || {};
  const room = scheduleData.room || {};
  const cinema = (room && room.cinema) ? room.cinema : { name: 'Không xác định', address: 'Không xác định' };
  const scheduleId = scheduleData.schedule_id || scheduleData.id;
  
  // Tạo đường dẫn chỉnh sửa
  const editUrl = `http://localhost:3005/schedule/edit/${scheduleId}`;
  
  // Hiển thị nút CTA cho email thêm/sửa lịch chiếu
  const actionButton = (action === 'create' || action === 'update') ? `
    <div style="text-align: center; margin: 20px 0;">
      <a href="${editUrl}" style="display: inline-block; background-color: #003366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Xem và chỉnh sửa lịch chiếu
      </a>
    </div>
  ` : '';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; background-color: #003366; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
        <h1 style="margin: 0;">Cinema App</h1>
      </div>
      
      <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">Thông tin lịch chiếu #${scheduleId}</h2>
      
      <div style="margin-bottom: 20px;">
        <div style="padding-right: 20px;">
          <h3 style="color: #003366;">Thông tin phim</h3>
          <div style="display: flex; margin-bottom: 15px;">
            <div style="width: 120px; margin-right: 15px;">
              <img src="${movie.img || 'https://via.placeholder.com/120x180?text=No+Image'}" alt="${movie.name || 'Phim'}" style="width: 100%; border-radius: 5px; box-shadow: 0 0 5px rgba(0,0,0,0.2);">
            </div>
            <div>
              <p style="font-weight: bold; font-size: 18px; margin: 0 0 5px 0;">${movie.name || 'Không có thông tin'}</p>
              <p style="margin: 0 0 5px 0;"><strong>Thể loại:</strong> ${movie.genre || 'Không có thông tin'}</p>
              <p style="margin: 0 0 5px 0;"><strong>Thời lượng:</strong> ${movie.duration || '?'} phút</p>
              <p style="margin: 0 0 5px 0;"><strong>Phân loại:</strong> ${movie.label || 'Không có thông tin'}</p>
              <p style="margin: 0;"><strong>Trạng thái:</strong> ${movie.status || 'Không có thông tin'}</p>
            </div>
          </div>
          <p><strong>Mô tả:</strong> ${movie.description || 'Không có mô tả'}</p>
        </div>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="color: #003366; margin-top: 0;">Thông tin rạp & phòng chiếu</h3>
        <p><strong>Rạp:</strong> ${cinema.name}</p>
        <p><strong>Địa chỉ:</strong> ${cinema.address}</p>
        <p><strong>Phòng chiếu:</strong> ${room.name || 'Không có thông tin'}</p>
        <p><strong>Loại phòng:</strong> ${room.type || 'Không có thông tin'}</p>
        <p><strong>Số ghế:</strong> ${room.seats || 'Không có thông tin'}</p>
        <p><strong>Mô tả phòng:</strong> ${room.description || 'Không có mô tả'}</p>
      </div>
      
      <div style="background-color: #e6f7ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="color: #003366; margin-top: 0;">Thông tin lịch chiếu</h3>
        <p><strong>Thời gian bắt đầu:</strong> ${new Date(scheduleData.start_time).toLocaleString('vi-VN')}</p>
        <p><strong>Thời gian kết thúc:</strong> ${new Date(scheduleData.end_time).toLocaleString('vi-VN')}</p>
        <p><strong>Giá vé thường:</strong> ${parseInt(scheduleData.normal_seat_price).toLocaleString('vi-VN')} VNĐ</p>
        <p><strong>Giá vé VIP:</strong> ${parseInt(scheduleData.vip_seat_price).toLocaleString('vi-VN')} VNĐ</p>
      </div>
      
      ${actionButton}
      
      <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
        <p>Email này được gửi tự động từ hệ thống Cinema Appp</p>
        <p>&copy; 2025 Cinema App. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Gửi email thông báo khi tạo lịch chiếu mới
 */
async function sendScheduleCreatedEmail(scheduleData) {
  const subject = 'Lịch chiếu mới đã được tạo';
  
  try {
    // Kiểm tra dữ liệu hợp lệ
    if (!scheduleData || !scheduleData.start_time) {
      throw new Error('Dữ liệu lịch chiếu không hợp lệ');
    }
    
    // Lấy thông tin từ dữ liệu đã có
    const movie = scheduleData.movie || {};
    const room = scheduleData.room || {};
    const scheduleId = scheduleData.schedule_id || scheduleData.id;
    
    // Tạo HTML chi tiết với action 'create'
    const html = createDetailedTemplate(scheduleData, 'create');
    
    // Tạo nội dung text đơn giản
    const text = `Lịch chiếu mới #${scheduleId} đã được tạo cho phim "${movie.name || 'Không có thông tin'}" tại phòng "${room.name || 'Không có thông tin'}" vào lúc ${new Date(scheduleData.start_time).toLocaleString('vi-VN')}. Xem và chỉnh sửa tại: http://localhost:3005/schedule/edit/${scheduleId}`;
    
    // Gửi email
    return sendEmail(subject, text, html);
  } catch (error) {
    logger.error(`Error creating schedule email: ${error.message}`);
    
    // Fallback to simple email if error occurs
    const scheduleId = scheduleData.schedule_id || scheduleData.id;
    const editUrl = `http://localhost:3005/schedule/edit/${scheduleId}`;
    
    const simpleHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h1 style="color: #003366;">Lịch chiếu mới đã được tạo</h1>
        <p>Thông tin lịch chiếu:</p>
        <ul>
          <li><strong>ID lịch chiếu:</strong> ${scheduleId}</li>
          <li><strong>ID phim:</strong> ${scheduleData.movie_id || (scheduleData.movie ? scheduleData.movie.id : 'N/A')}</li>
          <li><strong>ID phòng:</strong> ${scheduleData.room_id || (scheduleData.room ? scheduleData.room.id : 'N/A')}</li>
          <li><strong>Thời gian bắt đầu:</strong> ${new Date(scheduleData.start_time).toLocaleString('vi-VN')}</li>
          <li><strong>Thời gian kết thúc:</strong> ${new Date(scheduleData.end_time).toLocaleString('vi-VN')}</li>
          <li><strong>Giá vé thường:</strong> ${scheduleData.normal_seat_price} VNĐ</li>
          <li><strong>Giá vé VIP:</strong> ${scheduleData.vip_seat_price} VNĐ</li>
        </ul>
        <p><a href="${editUrl}" style="color: #003366;">Xem và chỉnh sửa lịch chiếu</a></p>
      </div>
    `;
    
    return sendEmail(subject, `Lịch chiếu mới đã được tạo: ${scheduleId}. Xem và chỉnh sửa tại: ${editUrl}`, simpleHtml);
  }
}

/**
 * Gửi email thông báo khi cập nhật lịch chiếu
 */
async function sendScheduleUpdatedEmail(scheduleData) {
  const subject = 'Lịch chiếu đã được cập nhật';
  
  try {
    // Kiểm tra dữ liệu hợp lệ
    if (!scheduleData || !scheduleData.start_time) {
      throw new Error('Dữ liệu lịch chiếu không hợp lệ');
    }
    
    // Lấy thông tin từ dữ liệu đã có
    const movie = scheduleData.movie || {};
    const room = scheduleData.room || {};
    const scheduleId = scheduleData.schedule_id || scheduleData.id;
    
    // Tạo HTML với template đã có và action 'update'
    const html = createDetailedTemplate(scheduleData, 'update');
    
    // Tạo nội dung text đơn giản
    const text = `Lịch chiếu #${scheduleId} cho phim "${movie.name || 'Không có thông tin'}" tại phòng "${room.name || 'Không có thông tin'}" đã được cập nhật. Thời gian chiếu mới: ${new Date(scheduleData.start_time).toLocaleString('vi-VN')}. Xem và chỉnh sửa tại: http://localhost:3005/schedule/edit/${scheduleId}`;
    
    // Gửi email
    return sendEmail(subject, text, html);
  } catch (error) {
    logger.error(`Error creating update email: ${error.message}`);
    
    // Fallback to simple email if error occurs
    const scheduleId = scheduleData.schedule_id || scheduleData.id;
    const editUrl = `http://localhost:3005/schedule/edit/${scheduleId}`;
    
    const simpleHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h1 style="color: #003366;">Lịch chiếu đã được cập nhật</h1>
        <p>Thông tin lịch chiếu sau khi cập nhật:</p>
        <ul>
          <li><strong>ID lịch chiếu:</strong> ${scheduleId}</li>
          <li><strong>ID phim:</strong> ${scheduleData.movie_id || (scheduleData.movie ? scheduleData.movie.id : 'N/A')}</li>
          <li><strong>ID phòng:</strong> ${scheduleData.room_id || (scheduleData.room ? scheduleData.room.id : 'N/A')}</li>
          <li><strong>Thời gian bắt đầu:</strong> ${new Date(scheduleData.start_time).toLocaleString('vi-VN')}</li>
          <li><strong>Thời gian kết thúc:</strong> ${new Date(scheduleData.end_time).toLocaleString('vi-VN')}</li>
          <li><strong>Giá vé thường:</strong> ${scheduleData.normal_seat_price} VNĐ</li>
          <li><strong>Giá vé VIP:</strong> ${scheduleData.vip_seat_price} VNĐ</li>
        </ul>
        <p><a href="${editUrl}" style="color: #003366;">Xem và chỉnh sửa lịch chiếu</a></p>
      </div>
    `;
    
    return sendEmail(subject, `Lịch chiếu ${scheduleId} đã được cập nhật. Xem và chỉnh sửa tại: ${editUrl}`, simpleHtml);
  }
}

/**
 * Gửi email thông báo khi xóa lịch chiếu
 */
async function sendScheduleDeletedEmail(scheduleData) {
  const subject = 'Lịch chiếu đã bị xóa';
  
  // Xử lý trường hợp scheduleData là null hoặc undefined
  if (scheduleData === null || scheduleData === undefined) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #003366;">Lịch chiếu đã bị xóa</h2>
        <p>Một lịch chiếu đã bị xóa khỏi hệ thống.</p>
      </div>
    `;
    
    return sendEmail(subject, "Lịch chiếu đã bị xóa", html);
  }
  
  // Nếu scheduleData là số hoặc chuỗi (ID đơn thuần)
  if (typeof scheduleData === 'number' || typeof scheduleData === 'string') {
    const scheduleId = scheduleData;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; background-color: #003366; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="margin: 0;">Cinema App</h1>
        </div>
        
        <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">Lịch chiếu đã bị xóa</h2>
        <p style="font-size: 16px;">Lịch chiếu có ID: <strong>${scheduleId}</strong> đã bị xóa khỏi hệ thống.</p>
        
        <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
          <p>Email này được gửi tự động từ hệ thống Cinema App</p>
          <p>&copy; 2025 Cinema App. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return sendEmail(subject, `Lịch chiếu ${scheduleId} đã bị xóa`, html);
  }
  
  // Kiểm tra xem có phải là object đầy đủ hay chỉ là object có id
  const hasFullData = scheduleData && 
                       scheduleData.start_time && 
                       scheduleData.movie && 
                       scheduleData.room;
  
  // Nếu chỉ có ID và không có thông tin chi tiết
  if (!hasFullData) {
    const scheduleId = scheduleData.id || 'không xác định';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; background-color: #003366; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="margin: 0;">Cinema App</h1>
        </div>
        
        <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">Lịch chiếu đã bị xóa</h2>
        <p style="font-size: 16px;">Lịch chiếu có ID: <strong>${scheduleId}</strong> đã bị xóa khỏi hệ thống.</p>
        
        <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
          <p>Email này được gửi tự động từ hệ thống Cinema App</p>
          <p>&copy; 2025 Cinema App. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return sendEmail(subject, `Lịch chiếu ${scheduleId} đã bị xóa`, html);
  }
  
  // Nếu có thông tin đầy đủ - sử dụng code hiện tại của bạn
  try {
    // Lấy thông tin từ dữ liệu đã có
    const movie = scheduleData.movie || {};
    const room = scheduleData.room || {};
    const scheduleId = scheduleData.schedule_id || scheduleData.id;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; background-color: #003366; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="margin: 0;">Cinema App</h1>
        </div>
        
        <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">Lịch chiếu đã bị xóa</h2>
        
        <p style="font-size: 16px;">Lịch chiếu cho phim <strong>${movie.name || 'Không có thông tin'}</strong> tại phòng <strong>${room.name || 'Không có thông tin'}</strong> đã bị xóa khỏi hệ thống.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #003366; margin-top: 0;">Thông tin lịch chiếu đã xóa</h3>
          <p><strong>ID lịch chiếu:</strong> ${scheduleId}</p>
          <p><strong>Phim:</strong> ${movie.name || 'Không có thông tin'}</p>
          <p><strong>Phòng chiếu:</strong> ${room.name || 'Không có thông tin'}</p>
          <p><strong>Thời gian bắt đầu:</strong> ${new Date(scheduleData.start_time).toLocaleString('vi-VN')}</p>
          <p><strong>Thời gian kết thúc:</strong> ${new Date(scheduleData.end_time).toLocaleString('vi-VN')}</p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
          <p>Email này được gửi tự động từ hệ thống Cinema App</p>
          <p>&copy; 2025 Cinema App. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return sendEmail(subject, `Lịch chiếu phim ${movie.name || scheduleId} đã bị xóa`, html);
  } catch (error) {
    logger.error(`Error creating delete email: ${error.message}`);
    
    // Fallback to simple email if error occurs
    const scheduleId = scheduleData.id || scheduleData.schedule_id || 'không xác định';
    const simpleHtml = `
      <h1>Lịch chiếu đã bị xóa</h1>
      <p>Lịch chiếu có ID: <strong>${scheduleId}</strong> đã bị xóa khỏi hệ thống.</p>
    `;
    
    return sendEmail(subject, `Lịch chiếu ${scheduleId} đã bị xóa`, simpleHtml);
  }
}

module.exports = {
  sendScheduleCreatedEmail,
  sendScheduleUpdatedEmail,
  sendScheduleDeletedEmail
};