import React from 'react';
import { Alert } from 'react-bootstrap';
import { formatDate } from '../../utils/scheduleUtils';

const ConflictAlert = ({ hasConflict, conflictDetails }) => {
  if (!hasConflict || !conflictDetails) {
    return null;
  }

  return (
    <>
      <div className="text-danger mt-1">
        <small>
          {conflictDetails.isInvalidTime ? (
            "Thời gian kết thúc phải sau thời gian bắt đầu."
          ) : (
            `Lịch chiếu trùng với phim "${conflictDetails.movie.name}" 
             từ ${formatDate(conflictDetails.start_time)} đến ${formatDate(conflictDetails.end_time)}`
          )}
        </small>
      </div>
      {!conflictDetails.isInvalidTime && (
        <Alert variant="warning" className="mt-2 mb-0">
          Không thể tạo lịch chiếu do trùng với lịch chiếu hiện có. Vui lòng chọn thời gian khác.
        </Alert>
      )}
    </>
  );
};

export default ConflictAlert;