const { body, param } = require('express-validator');

exports.validateCreateRoom = [
  body('cinema_id').isInt().withMessage('ID rạp phim phải là số nguyên'),
  body('name').notEmpty().withMessage('Tên phòng không được để trống'),
  body('seats').isInt({ min: 1 }).withMessage('Số ghế phải là số nguyên dương'),
  body('type').isIn(['Standard', 'IMAX', 'VIP', '4DX', 'SCREENX']).withMessage('Loại phòng không hợp lệ')
];

exports.validateCinemaId = [
  param('cinemaId').isInt().withMessage('ID rạp phim phải là số nguyên')
];