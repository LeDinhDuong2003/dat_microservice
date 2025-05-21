const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { validateSchedule } = require('../validators/scheduleValidator');

// CRUD operations
router.post('/', validateSchedule, scheduleController.createSchedule);
router.get('/', scheduleController.getAllSchedules);

// Các route với prefix cụ thể phải đứng trước route với tham số
router.get('/with-movies', scheduleController.getSchedulesWithMovieDetails);
router.get('/filtered', scheduleController.getFilteredSchedules);
router.get('/room/:roomId', scheduleController.getSchedulesByRoomId);

// Route lấy chi tiết lịch chiếu theo ID (đã có đầy đủ thông tin)
router.get('/:id', scheduleController.getScheduleById);

// Các route cập nhật và xóa
router.put('/:id', validateSchedule, scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;