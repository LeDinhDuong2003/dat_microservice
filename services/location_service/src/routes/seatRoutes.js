const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

router.post('/seats', seatController.createSeat);
router.get('/rooms/:roomId/seats', seatController.getSeatsByRoom);

module.exports = router;