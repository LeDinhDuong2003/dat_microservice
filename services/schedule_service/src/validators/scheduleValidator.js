const { body, validationResult } = require('express-validator');

exports.validateSchedule = [
  body('movie_id').isInt().withMessage('movie_id phải là số nguyên'),
  body('room_id').isInt().withMessage('room_id phải là số nguyên'),
  body('start_time').isISO8601().withMessage('start_time phải là datetime hợp lệ'),
  body('end_time').isISO8601().withMessage('end_time phải là datetime hợp lệ'),
  body('normal_seat_price')
    .isFloat({ min: 0 })
    .withMessage('normal_seat_price phải là số dương')
    .optional({ nullable: false, checkFalsy: false }),
  body('vip_seat_price')
    .isFloat({ min: 0 })
    .withMessage('vip_seat_price phải là số dương')
    .optional({ nullable: false, checkFalsy: false }),
  
  // Kiểm tra custom: giá vé VIP phải lớn hơn hoặc bằng giá vé thường
  body('vip_seat_price').custom((value, { req }) => {
    if (parseFloat(value) < parseFloat(req.body.normal_seat_price)) {
      throw new Error('Giá vé VIP phải lớn hơn hoặc bằng giá vé thường');
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];