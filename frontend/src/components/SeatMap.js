import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { roomService } from '../services/api';

const SeatMap = ({ roomId }) => {
  const [seats, setSeats] = useState([]);
  const [seatMap, setSeatMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch seats when roomId changes
  useEffect(() => {
    const fetchSeats = async () => {
      if (!roomId) {
        setSeats([]);
        setSeatMap({});
        return;
      }

      try {
        setLoading(true);
        setError('');
        const seatsData = await roomService.getSeatsByRoom(roomId);
        setSeats(seatsData);
        
        // Process seats data into a map organized by rows and columns
        const seatsByRow = {};
        
        seatsData.forEach(seat => {
          // Extract row letter and column number from seat name (e.g., "A1" => row "A", column "1")
          const row = seat.name.charAt(0);
          const col = seat.name.substring(1);
          
          if (!seatsByRow[row]) {
            seatsByRow[row] = {};
          }
          
          seatsByRow[row][col] = {
            id: seat.id,
            type: seat.type
          };
        });
        
        setSeatMap(seatsByRow);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching seats:', err);
        setError('Không thể tải danh sách ghế. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchSeats();
  }, [roomId]);

  // Get all unique rows and columns
  const getRows = () => {
    return Object.keys(seatMap).sort();
  };
  
  const getMaxColumns = () => {
    let maxCol = 0;
    
    Object.values(seatMap).forEach(row => {
      const cols = Object.keys(row).map(Number);
      if (cols.length > 0) {
        const max = Math.max(...cols);
        if (max > maxCol) maxCol = max;
      }
    });
    
    return maxCol;
  };
  
  // Render seat based on type
  const renderSeat = (row, col) => {
    const seatData = seatMap[row]?.[col];
    
    if (!seatData) {
      return <div className="seat-placeholder"></div>;
    }
    
    const seatClass = seatData.type === 'VIP' ? 'seat-vip' : 'seat-standard';
    
    return (
      <div className={`seat ${seatClass}`} title={`${row}${col} - ${seatData.type}`}>
        {row}{col}
      </div>
    );
  };

  // If no room is selected
  if (!roomId) {
    return (
      <Card className="mt-3 mb-3">
        <Card.Body className="text-center">
          <p className="text-muted">Vui lòng chọn phòng chiếu để xem bản đồ ghế ngồi.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mt-3 mb-3">
      <Card.Header className="bg-secondary text-white">
        <h5 className="mb-0">Bản Đồ Ghế Ngồi</h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải bản đồ ghế...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            <div className="seat-map-container">
              <div className="screen-container mb-4">
                <div className="screen">Màn hình</div>
              </div>
              
              <div className="seat-grid">
                {getRows().map(row => (
                  <div key={row} className="seat-row">
                    <div className="row-label">{row}</div>
                    {Array.from({ length: getMaxColumns() }, (_, i) => i + 1).map(col => (
                      <div key={`${row}-${col}`} className="seat-column">
                        {renderSeat(row, col.toString())}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Row className="seat-legend">
                  <Col xs={6} md={3} className="mb-2">
                    <div className="d-flex align-items-center">
                      <div className="seat seat-standard seat-small me-2"></div>
                      <span>Ghế Thường</span>
                    </div>
                  </Col>
                  <Col xs={6} md={3} className="mb-2">
                    <div className="d-flex align-items-center">
                      <div className="seat seat-vip seat-small me-2"></div>
                      <span>Ghế VIP</span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default SeatMap;