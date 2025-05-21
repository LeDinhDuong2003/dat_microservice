import React from 'react';
import { Card, Table, Spinner, Badge, Image } from 'react-bootstrap';

const RoomScheduleList = ({ roomId, schedules, loading }) => {
  // Fallback image
  const fallbackImage = "https://via.placeholder.com/120x180/e0e0e0/808080?text=No+Image";

  // Hàm hiển thị thời gian chính xác như API trả về
  const displayOriginalTime = (isoString) => {
    if (!isoString) return '';
    
    // Tạo đối tượng Date nhưng không chuyển đổi múi giờ
    const date = new Date(isoString);
    
    // Định dạng ngày tháng
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    const dateStr = date.toLocaleDateString('vi-VN', options);
    
    // Lấy giờ phút từ chuỗi ISO nguyên bản để tránh vấn đề múi giờ
    const timePart = isoString.substring(11, 16);
    
    return `${dateStr} ${timePart}`;
  };

  // If no room is selected
  if (!roomId) {
    return null;
  }

  return (
    <Card className="mb-3 mt-4">
      <Card.Header className="bg-secondary text-white">
        <h5 className="mb-0">Lịch Chiếu Hiện Tại Của Phòng</h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
            <p className="mb-0 mt-2">Đang tải lịch chiếu...</p>
          </div>
        ) : schedules.length === 0 ? (
          <p className="text-muted mb-0">Phòng này chưa có lịch chiếu nào.</p>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Phim</th>
                  <th>Thời gian bắt đầu</th>
                  <th>Thời gian kết thúc</th>
                  <th>Thời lượng</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.schedule_id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <Image 
                          src={schedule.movie.img || fallbackImage}
                          alt={schedule.movie.name}
                          onError={(e) => { e.target.src = fallbackImage; }}
                          style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                          className="me-2"
                        />
                        <div>
                          <strong>{schedule.movie.name}</strong>
                          <div>
                            <Badge bg="secondary" className="me-1">{schedule.movie.genre}</Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {displayOriginalTime(schedule.start_time)}
                      {/* <div className="text-muted small">
                        <code className="bg-light p-1 rounded">
                          {schedule.start_time}
                        </code>
                      </div> */}
                    </td>
                    <td>
                      {displayOriginalTime(schedule.end_time)}
                      {/* <div className="text-muted small">
                        <code className="bg-light p-1 rounded">
                          {schedule.end_time}
                        </code>
                      </div> */}
                    </td>
                    <td>{schedule.movie.duration} phút</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RoomScheduleList;