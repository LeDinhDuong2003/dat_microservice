import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, cinemaService, scheduleService } from '../services/api';
import { checkScheduleConflicts } from '../utils/scheduleUtils';

export function useEditScheduleForm() {
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
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [roomSchedules, setRoomSchedules] = useState([]);
  const [endTime, setEndTime] = useState('');
  const [originalSchedule, setOriginalSchedule] = useState(null);
  
  // Conflict state
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictDetails, setConflictDetails] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch schedule data
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setDataLoading(true);
        
        // Fetch schedule data
        const scheduleData = await scheduleService.getScheduleById(scheduleId);
        setOriginalSchedule(scheduleData);
        
        // Fetch initial data
        const [moviesData, cinemasData] = await Promise.all([
          movieService.getMovies(),
          cinemaService.getCinemas()
        ]);
        
        setMovies(moviesData);
        setCinemas(cinemasData);
        
        // Find selected movie
        const movie = moviesData.find(m => m.id === scheduleData.movie_id);
        setSelectedMovie(movie);
        
        // Fetch rooms for the selected cinema
        const roomsData = await cinemaService.getRoomsByCinema(scheduleData.cinema_id);
        setRooms(roomsData);
        
        // Extract date and time parts from ISO strings to avoid timezone issues
        const extractDateTime = (isoString) => {
          const datePart = isoString.substring(0, 10);
          const timePart = isoString.substring(11, 16);
          return `${datePart}T${timePart}`;
        };
        
        // Set form data
        setFormData({
          movie_id: scheduleData.movie_id.toString(),
          cinema_id: scheduleData.cinema_id.toString(),
          room_id: scheduleData.room_id.toString(),
          start_time: extractDateTime(scheduleData.start_time),
          normal_seat_price: scheduleData.normal_seat_price,
          vip_seat_price: scheduleData.vip_seat_price
        });
        
        setEndTime(extractDateTime(scheduleData.end_time));
        
        setDataLoading(false);
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError('Không thể tải thông tin lịch chiếu. Vui lòng thử lại sau.');
        setDataLoading(false);
      }
    };
    
    fetchScheduleData();
  }, [scheduleId]);
  
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
        
        // Lọc bỏ lịch chiếu hiện tại để không kiểm tra xung đột với chính nó
        const filteredSchedules = schedulesData.filter(
          schedule => schedule.schedule_id !== parseInt(scheduleId)
        );
        
        setRoomSchedules(filteredSchedules);
        setSchedulesLoading(false);
        
        // Check for conflicts if start time is already selected
        if (formData.start_time && endTime) {
          const conflict = checkScheduleConflicts(formData.start_time, endTime, filteredSchedules);
          setHasConflict(conflict.hasConflict);
          setConflictDetails(conflict.conflictDetails);
        }
      } catch (err) {
        console.error('Error fetching room schedules:', err);
        setError('Không thể tải lịch chiếu phòng. Vui lòng thử lại sau.');
        setSchedulesLoading(false);
      }
    };
    
    fetchRoomSchedules();
  }, [formData.room_id, scheduleId]);
  
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
      const formattedEndTime = `${endDate}T${endTimeStr}`;
      
      setEndTime(formattedEndTime);
      
      // Check for conflicts with existing schedules
      if (formData.room_id && roomSchedules.length > 0) {
        const conflict = checkScheduleConflicts(formData.start_time, formattedEndTime, roomSchedules);
        setHasConflict(conflict.hasConflict);
        setConflictDetails(conflict.conflictDetails);
      }
    } else {
      setEndTime('');
      setHasConflict(false);
      setConflictDetails(null);
    }
  }, [selectedMovie, formData.start_time, roomSchedules]);
  
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
  
  // Handle form submission for update
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
        ...formData,
        end_time: endTime
      };
      
      // Call API to update schedule
      await scheduleService.updateSchedule(scheduleId, scheduleData);
      
      setSuccess('Cập nhật lịch chiếu phim thành công!');
      
      // Redirect to dashboard after a delay
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
  
  return {
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
    dataLoading,
    schedulesLoading,
    error,
    success,
    handleMovieChange,
    handleInputChange,
    handleSubmit,
    handleCancel,
    getMinDateTime,
    setError,
    setSuccess
  };
}