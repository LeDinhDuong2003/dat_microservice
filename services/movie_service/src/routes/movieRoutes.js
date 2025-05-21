const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { movieValidationRules } = require('../validators/movieValidator');
const { validationResult } = require('express-validator');

// Middleware kiểm tra lỗi validate
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Route thêm phim
router.post('/', movieValidationRules, validate, movieController.createMovie);

// Route lấy danh sách phim (hỗ trợ tìm kiếm theo tham số query)
router.get('/', movieController.searchMovies);

// Route tìm kiếm - ĐẶT TRƯỚC route có tham số
router.get('/search', movieController.searchMovies);

// Route lấy phim theo ID - ĐẶT SAU các route cụ thể
router.get('/:id', movieController.getMovieById);

module.exports = router;