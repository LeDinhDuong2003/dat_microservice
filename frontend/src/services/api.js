import axios from 'axios';

const API_URL = 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  }
};

export const scheduleService = {
  getSchedulesWithMovies: async () => {
    const response = await api.get('/schedules/with-movies');
    return response.data;
  },

  getFilteredSchedules: async (filters) => {
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.movie_name) queryParams.append('movie_name', filters.movie_name);
    if (filters.cinema_id) queryParams.append('cinema_id', filters.cinema_id);
    
    const response = await api.get(`/schedules/filtered?${queryParams.toString()}`);
    return response.data;
  },
  
  createSchedule: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  deleteSchedule: async (scheduleId) => {
    const response = await api.delete(`/schedules/${scheduleId}`);
    return response.data;
  },

  getRoomSchedules: async (roomId) => {
    const response = await api.get(`/schedules/room/${roomId}`);
    return response.data;
  },

  // Lấy chi tiết lịch chiếu theo ID
  getScheduleById: async (scheduleId) => {
    const response = await api.get(`/schedules/${scheduleId}`);
    return response.data;
  },
  
  // Cập nhật lịch chiếu
  updateSchedule: async (scheduleId, scheduleData) => {
    const response = await api.put(`/schedules/${scheduleId}`, scheduleData);
    return response.data;
  }
};

export const movieService = {
  getMovies: async () => {
    const response = await api.get('/movies');
    return response.data;
  }
};

export const cinemaService = {
  getCinemas: async () => {
    const response = await api.get('/cinemas');
    return response.data;
  },
  
  getRoomsByCinema: async (cinemaId) => {
    const response = await api.get(`/cinemas/${cinemaId}/rooms`);
    return response.data;
  }
};

export const roomService = {
    getSeatsByRoom: async (roomId) => {
      const response = await api.get(`/rooms/${roomId}/seats`);
      return response.data;
    }
};

export default api;