import { useState, useEffect } from 'react';
import { movieService, cinemaService, scheduleService } from '../services/api';
import { checkScheduleConflicts } from '../utils/scheduleUtils';

export function useScheduleForm() {
  // Form state
  const [formData, setFormData] = useState({
    movie_id: '',
    cinema_id: '',
    room_id: '',
    start_time: '',
    normal_seat_price: '',
    vip_seat_price: ''
  });
  
  // Data from API
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [roomSchedules, setRoomSchedules] = useState([]);
  const [endTime, setEndTime] = useState('');
  
  // Conflict state
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictDetails, setConflictDetails] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [moviesData, cinemasData] = await Promise.all([
          movieService.getMovies(),
          cinemaService.getCinemas()
        ]);
        
        setMovies(moviesData);
        setCinemas(cinemasData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
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
        setRoomSchedules(schedulesData);
        setSchedulesLoading(false);
        
        // Check for conflicts if start time is already selected
        if (formData.start_time && endTime) {
          const conflict = checkScheduleConflicts(formData.start_time, endTime, schedulesData);
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
  }, [formData.room_id, formData.start_time, endTime]);
  
  // Calculate end time when movie or start time changes
  // Thay đổi đoạn code này trong useScheduleForm.js
  useEffect(() => {
    if (selectedMovie && formData.start_time) {
      // Lấy giá trị thời gian bắt đầu từ chuỗi ISO
      const startTimeStr = formData.start_time;
      
      // Tạo một bản sao của chuỗi ISO để xử lý
      const dateObj = new Date(startTimeStr);
      
      // Tính thời gian kết thúc bằng cách thêm thời lượng phim (phút)
      const durationMs = selectedMovie.duration * 60 * 1000;
      const endTimeObj = new Date(dateObj.getTime() + durationMs);
      
      // Giữ nguyên định dạng ISO cho thời gian kết thúc mà không chuyển đổi múi giờ
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
            // Đảm bảo đã import checkScheduleConflicts từ ../utils/scheduleUtils
            const conflict = checkScheduleConflicts(formData.start_time, formattedEndTime, roomSchedules);
            console.log("Conflict check result:", conflict); // Thêm dòng này để debug
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
        setError('Không thể tạo lịch chiếu do trùng lịch với suất chiếu khác.');
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
      
      // Call API to create schedule
      await scheduleService.createSchedule(scheduleData);
      
      // Reset form after successful submission
      setFormData({
        movie_id: '',
        cinema_id: '',
        room_id: '',
        start_time: '',
        normal_seat_price: '',
        vip_seat_price: ''
      });
      setSelectedMovie(null);
      setEndTime('');
      setRoomSchedules([]);
      
      setSuccess('Lịch chiếu phim đã được tạo thành công!');
      setLoading(false);
    } catch (err) {
      console.error('Error creating schedule:', err);
      setError(err.response?.data?.message || 'Không thể tạo lịch chiếu. Vui lòng thử lại sau.');
      setLoading(false);
    }
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
    schedulesLoading,
    error,
    success,
    handleMovieChange,
    handleInputChange,
    handleSubmit,
    getMinDateTime,
    setError,
    setSuccess
  };
}