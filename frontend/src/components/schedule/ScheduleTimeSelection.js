import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import ConflictAlert from './ConflictAlert';

const ScheduleTimeSelection = ({ 
  startTime, 
  endTime, 
  normalPrice, 
  vipPrice, 
  hasConflict,
  conflictDetails,
  onChange, 
  minDateTime, 
  disabled 
}) => {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Thời Gian Bắt Đầu</Form.Label>
        <Form.Control 
          type="datetime-local" 
          name="start_time" 
          value={startTime} 
          onChange={onChange}
          min={minDateTime}
          disabled={disabled}
          className={hasConflict ? 'border-danger' : ''}
        />
        <ConflictAlert 
          hasConflict={hasConflict} 
          conflictDetails={conflictDetails} 
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Thời Gian Kết Thúc (Tự Động Tính)</Form.Label>
        <Form.Control 
          type="datetime-local" 
          value={endTime} 
          disabled={true}
          className={hasConflict ? 'border-danger' : ''}
        />
        <Form.Text className="text-muted">
          Thời gian kết thúc được tính dựa trên thời lượng phim.
        </Form.Text>
      </Form.Group>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Giá Vé Thường (VNĐ)</Form.Label>
            <Form.Control 
              type="number" 
              name="normal_seat_price" 
              value={normalPrice} 
              onChange={onChange}
              min="0"
              step="1000"
              placeholder="VD: 90000"
              disabled={disabled}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Giá Vé VIP (VNĐ)</Form.Label>
            <Form.Control 
              type="number" 
              name="vip_seat_price" 
              value={vipPrice} 
              onChange={onChange}
              min="0"
              step="1000"
              placeholder="VD: 150000"
              disabled={disabled}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default ScheduleTimeSelection;