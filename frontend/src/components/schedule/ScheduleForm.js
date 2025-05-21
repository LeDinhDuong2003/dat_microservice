import React from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import MovieSelection from './MovieSelection';
import CinemaRoomSelection from './CinemaRoomSelection';
import ScheduleTimeSelection from './ScheduleTimeSelection';
import RoomScheduleList from './RoomScheduleList';
import SeatMap from '../SeatMap';
import { useScheduleForm } from '../../hooks/useScheduleForm';
import ConflictAlert from './ConflictAlert';
import '../../styles/SeatMap.css';

const ScheduleForm = () => {
  const {
    formData,
    endTime,
    movies,
    cinemas,
    rooms,
    selectedMovie,
    roomSchedules,
    hasConflict,
    conflictDetails,
    loading,
    schedulesLoading,
    error,
    success,
    handleMovieChange,
    handleInputChange,
    handleSubmit,
    getMinDateTime,
    setError,
    setSuccess
  } = useScheduleForm();

  return (
    <Container className="mt-4 mb-5">
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Lên Lịch Chiếu Phim</h4>
            </Card.Header>
            <Card.Body>
              {loading && (
                <div className="text-center mb-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Đang xử lý...</p>
                </div>
              )}
              
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12} lg={6}>
                    <MovieSelection 
                      movies={movies}
                      selectedMovie={selectedMovie}
                      value={formData.movie_id}
                      onChange={handleMovieChange}
                      disabled={loading}
                    />
                    
                    <CinemaRoomSelection 
                      cinemas={cinemas}
                      rooms={rooms}
                      cinemaValue={formData.cinema_id}
                      roomValue={formData.room_id}
                      onCinemaChange={handleInputChange}
                      onRoomChange={handleInputChange}
                      disabled={loading}
                    />
                    
                    {/* Seat Map Component */}
                    <SeatMap roomId={formData.room_id} />
                  </Col>
                  
                  <Col md={12} lg={6}>
                    <ScheduleTimeSelection 
                      startTime={formData.start_time}
                      endTime={endTime}
                      normalPrice={formData.normal_seat_price}
                      vipPrice={formData.vip_seat_price}
                      hasConflict={hasConflict}
                      conflictDetails={conflictDetails}
                      onChange={handleInputChange}
                      minDateTime={getMinDateTime()}
                      disabled={loading}
                    />
                    
                    <RoomScheduleList 
                      roomId={formData.room_id}
                      schedules={roomSchedules}
                      loading={schedulesLoading}
                    />
                  </Col>
                </Row>
                
                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={loading || hasConflict}
                  >
                    {loading ? 'Đang Xử Lý...' : 'Tạo Lịch Chiếu'}
                  </Button>
                  {hasConflict && (
                    <ConflictAlert 
                      hasConflict={hasConflict} 
                      conflictDetails={conflictDetails} 
                    />
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ScheduleForm;