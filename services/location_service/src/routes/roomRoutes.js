const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.post('/rooms', roomController.createRoom);
router.get('/cinemas/:cinemaId/rooms', roomController.getRoomsByCinema);
router.get('/rooms/:id', roomController.getRoomById); // Thêm route mới

module.exports = router;