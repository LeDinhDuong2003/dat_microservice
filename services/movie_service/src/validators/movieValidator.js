const { body } = require('express-validator');

exports.movieValidationRules = [
  body('name').notEmpty().withMessage('Tên phim là bắt buộc'),
  body('duration').isInt({ min: 1 }).withMessage('Thời lượng phải là số nguyên dương'),
];
