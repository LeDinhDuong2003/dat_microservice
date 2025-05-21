const { body, param } = require('express-validator');

exports.validateCreateSeat = [
  body('room_id').isInt().withMessage('ID phòng chiếu phải là số nguyên'),
  body('name').notEmpty().withMessage('Tên ghế không được để trống'),
  body('type').isIn(['thường', 'vip']).withMessage('Loại ghế phải là "thường" hoặc "vip"')
];

exports.validateRoomId = [
  param('roomId').isInt().withMessage('ID phòng chiếu phải là số nguyên')
];