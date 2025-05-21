const express = require('express');
const router = express.Router();
const cinemaController = require('../controllers/cinemaController');

router.post('/cinemas', cinemaController.createCinema);
router.get('/cinemas', cinemaController.getAllCinemas);

module.exports = router;
