import React from 'react';
import { Form } from 'react-bootstrap';

const CinemaRoomSelection = ({ 
  cinemas, 
  rooms, 
  cinemaValue, 
  roomValue, 
  onCinemaChange, 
  onRoomChange, 
  disabled 
}) => {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Chọn Rạp Chiếu</Form.Label>
        <Form.Select 
          name="cinema_id" 
          value={cinemaValue} 
          onChange={onCinemaChange}
          disabled={disabled}
        >
          <option value="">-- Chọn Rạp --</option>
          {cinemas.map(cinema => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name} - {cinema.address}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Chọn Phòng Chiếu</Form.Label>
        <Form.Select 
          name="room_id" 
          value={roomValue} 
          onChange={onRoomChange}
          disabled={disabled || !cinemaValue}
        >
          <option value="">-- Chọn Phòng --</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name} - {room.type} ({room.seats} ghế)
            </option>
          ))}
        </Form.Select>
        <Form.Text className="text-muted">
          Chọn rạp chiếu trước để xem danh sách phòng.
        </Form.Text>
      </Form.Group>
    </>
  );
};

export default CinemaRoomSelection;