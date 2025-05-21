import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import MovieSelection from './MovieSelection';
import CinemaRoomSelection from './CinemaRoomSelection';
import ScheduleTimeSelection from './ScheduleTimeSelection';
import RoomScheduleList from './RoomScheduleList';
import SeatMap from '../SeatMap';
import { scheduleService, movieService, cinemaService } from '../../services/api';
import { checkScheduleConflicts, parseISOTime } from '../../utils/scheduleUtils';
import '../../styles/SeatMap.css';

const EditScheduleForm = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    movie_id: '',
    cinema_id: '',
    room_id: '',
    start_time: '',
    normal_seat_price: '',
    vip_seat_price: ''
  });
  
  // Data states
  const [endTime, setEndTime] = useState('');
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [roomSchedules, setRoomSchedules] = useState([]);
  const [originalSchedule, setOriginalSchedule] = useState(null);
  
  // Conflict state
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictDetails, setConflictDetails] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch schedule details
  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch schedule details, movies and cinemas in parallel
        const [scheduleData, moviesData, cinemasData] = await Promise.all([
          scheduleService.getScheduleById(scheduleId),
          movieService.getMovies(),
          cinemaService.getCinemas()
        ]);
        
        // Save original schedule for reference
        setOriginalSchedule(scheduleData);
        
        // Set movies and cinemas
        setMovies(moviesData);
        setCinemas(cinemasData);
        
        // Find selected movie
        const movie = moviesData.find(m => m.id === scheduleData.movie.id);
        setSelectedMovie(movie);
        
        // Format datetime strings for form input
        const startTime = scheduleData.start_time.substring(0, 16);
        const endTimeStr = scheduleData.end_time.substring(0, 16);
        
        // Set initial form data
        setFormData({
          movie_id: scheduleData.movie.id.toString(),
          cinema_id: scheduleData.room.cinema.id.toString(),
          room_id: scheduleData.room.id.toString(),
          start_time: startTime,
          normal_seat_price: scheduleData.normal_seat_price,
          vip_seat_price: scheduleData.vip_seat_price
        });
        
        // Set end time
        setEndTime(endTimeStr);
        
        // Fetch rooms for the selected cinema
        const roomsData = await cinemaService.getRoomsByCinema(scheduleData.room.cinema.id);
        setRooms(roomsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching schedule details:', err);
        setError('Không thể tải thông tin lịch chiếu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchScheduleDetails();
  }, [scheduleId]);
  
  // Fetch room schedules when room changes
  useEffect(() => {
    const fetchRoomSchedules = async () => {
      if (!formData.room_id) {
        setRoomSchedules([]);
        return;
      }
      
      try {
        setSchedulesLoading(true);
        const schedulesData = await scheduleService.getRoomSchedules(formData.room_id);
        
        // Filter out the current schedule being edited
        const filteredSchedules = schedulesData.filter(
          schedule => schedule.schedule_id.toString() !== scheduleId
        );
        
        setRoomSchedules(filteredSchedules);
        setSchedulesLoading(false);
        
        // Check for conflicts if start time is already selected
        if (formData.start_time && endTime) {
          checkForConflicts(formData.start_time, endTime, filteredSchedules);
        }
      } catch (err) {
        console.error('Error fetching room schedules:', err);
        setError('Không thể tải lịch chiếu phòng. Vui lòng thử lại sau.');
        setSchedulesLoading(false);
      }
    };
    
    fetchRoomSchedules();
  }, [formData.room_id, scheduleId]);
  
  // Fetch rooms when cinema changes
  useEffect(() => {
    const fetchRooms = async () => {
      if (!formData.cinema_id) {
        setRooms([]);
        return;
      }
      
      try {
        setLoading(true);
        const roomsData = await cinemaService.getRoomsByCinema(formData.cinema_id);
        setRooms(roomsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Không thể tải danh sách phòng chiếu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [formData.cinema_id]);
  
  // Calculate end time when movie or start time changes
  useEffect(() => {
    if (selectedMovie && formData.start_time) {
      // Lấy giá trị thời gian bắt đầu từ chuỗi ISO
      const startTimeStr = formData.start_time;
      
      // Tạo một bản sao của chuỗi ISO để xử lý
      const dateObj = new Date(startTimeStr);
      
      // Lấy phần ngày và giờ từ chuỗi input ban đầu
      const startDate = startTimeStr.substring(0, 10);
      const startTime = startTimeStr.substring(11, 16);
      
      // Tính giờ và phút kết thúc từ giờ và phút bắt đầu
      let startHours = parseInt(startTime.substring(0, 2));
      let startMinutes = parseInt(startTime.substring(3, 5));
      
      // Tính tổng phút
      let totalMinutes = startMinutes + selectedMovie.duration;
      let additionalHours = Math.floor(totalMinutes / 60);
      let endMinutes = totalMinutes % 60;
      let endHours = (startHours + additionalHours) % 24;
      
      // Format lại giờ và phút kết thúc
      const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      // Cập nhật ngày nếu thời gian kết thúc là ngày hôm sau
      let endDate = startDate;
      if (startHours + additionalHours >= 24) {
        // Tăng ngày lên 1
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + Math.floor((startHours + additionalHours) / 24));
        endDate = nextDay.toISOString().substring(0, 10);
      }
      
      // Tạo chuỗi ISO cho thời gian kết thúc
      const formattedEndTime = `${endDate}T${endTimeStr}:00`;
      
      setEndTime(formattedEndTime);
      
      // Check for conflicts with existing schedules
      if (formData.room_id && roomSchedules.length > 0) {
        checkForConflicts(formData.start_time, formattedEndTime, roomSchedules);
      }
    } else {
      setEndTime('');
      setHasConflict(false);
      setConflictDetails(null);
    }
  }, [selectedMovie, formData.start_time, roomSchedules]);
  
  // Check for schedule conflicts
  const checkForConflicts = (startTime, endTime, schedules) => {
    const conflict = checkScheduleConflicts(startTime, endTime, schedules);
    setHasConflict(conflict.hasConflict);
    setConflictDetails(conflict.conflictDetails);
  };
  
  // Handle movie selection
  const handleMovieChange = (e) => {
    const movieId = e.target.value;
    setFormData({
      ...formData,
      movie_id: movieId
    });
    
    // Find the selected movie object
    const movie = movies.find(m => m.id.toString() === movieId);
    setSelectedMovie(movie);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.movie_id || !formData.cinema_id || !formData.room_id || 
        !formData.start_time || !formData.normal_seat_price || !formData.vip_seat_price) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    
    // Check for conflicts again to be extra safe
    if (formData.room_id && formData.start_time && endTime) {
      const conflict = checkScheduleConflicts(formData.start_time, endTime, roomSchedules);
      if (conflict.hasConflict) {
        setHasConflict(true);
        setConflictDetails(conflict.conflictDetails);
        setError('Không thể cập nhật lịch chiếu do trùng lịch với suất chiếu khác.');
        return;
      }
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Prepare data for API
      const scheduleData = {
        movie_id: formData.movie_id,
        room_id: formData.room_id,
        start_time: formData.start_time,
        end_time: endTime,
        normal_seat_price: formData.normal_seat_price,
        vip_seat_price: formData.vip_seat_price
      };
      
      // Call API to update schedule
      await scheduleService.updateSchedule(scheduleId, scheduleData);
      
      setSuccess('Lịch chiếu phim đã được cập nhật thành công!');
      
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật lịch chiếu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    navigate('/dashboard');
  };
  
  // Get minimum date-time for scheduling (current time)
  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };
  
  return (
    <Container className="mt-4 mb-5">
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Sửa Lịch Chiếu Phim</h4>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleCancel}
              >
                Quay lại
              </Button>
            </Card.Header>
            <Card.Body>
              {loading && (
                <div className="text-center mb-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Đang tải thông tin...</p>
                </div>
              )}
              
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
              
              {!loading && (
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
                  
                  <div className="d-flex gap-2 mt-4">
                    <Button 
                      variant="secondary" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Hủy bỏ
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="flex-grow-1"
                      disabled={loading || hasConflict}
                    >
                      {loading ? 'Đang Xử Lý...' : 'Cập Nhật Lịch Chiếu'}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditScheduleForm;