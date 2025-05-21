// utilities/scheduleUtils.js

// Format date for display without timezone issues
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Phân tách chuỗi ISO để lấy các thành phần
    const datePart = dateString.substring(0, 10); // YYYY-MM-DD
    const timePart = dateString.substring(11, 16); // HH:MM
    
    // Tạo đối tượng Date chỉ để định dạng phần ngày tháng
    const date = new Date(datePart);
    
    // Định dạng ngày tháng
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    const formattedDate = date.toLocaleDateString('vi-VN', options);
    
    // Kết hợp phần ngày đã định dạng với phần giờ nguyên bản
    return `${formattedDate}, ${timePart}`;
  };
  
  // Parse ISO datetime to separate components to avoid timezone issues
  const parseISOTime = (isoString) => {
    if (!isoString) return null;
    
    // Extract parts from ISO string
    const year = parseInt(isoString.substring(0, 4));
    const month = parseInt(isoString.substring(5, 7)) - 1; // JS months are 0-indexed
    const day = parseInt(isoString.substring(8, 10));
    const hour = parseInt(isoString.substring(11, 13));
    const minute = parseInt(isoString.substring(14, 16));
    
    // Create a timestamp for comparison (in minutes)
    // We're calculating minutes since epoch start to compare times more easily
    // This is simplified and only used for comparison
    return {
      year, month, day, hour, minute,
      // Calculate total minutes (days * 24 * 60 + hours * 60 + minutes)
      // This is for easier comparison
      totalMinutes: (year * 365 + month * 30 + day) * 24 * 60 + hour * 60 + minute
    };
  };
  
  // Check for schedule conflicts using string manipulation instead of Date objects
  export const checkScheduleConflicts = (startTime, endTime, schedules) => {
    if (!startTime || !endTime) {
      return { hasConflict: false, conflictDetails: null };
    }
    
    // Parse proposed times to avoid timezone issues
    const proposedStart = parseISOTime(startTime);
    const proposedEnd = parseISOTime(endTime);
    
    // Log for debugging
    console.log("Checking conflict for:", {
      proposedStart: startTime,
      proposedEnd: endTime,
      parsedStart: proposedStart,
      parsedEnd: proposedEnd
    });
    
    // Validate proposed times
    if (proposedStart.totalMinutes >= proposedEnd.totalMinutes) {
      return {
        hasConflict: true,
        conflictDetails: {
          movie: { name: "Lỗi thời gian" },
          start_time: startTime,
          end_time: endTime,
          isInvalidTime: true
        }
      };
    }
    
    // Sort schedules by start time for easier conflict detection
    const sortedSchedules = [...schedules].sort((a, b) => {
      const aStart = parseISOTime(a.start_time);
      const bStart = parseISOTime(b.start_time);
      return aStart.totalMinutes - bStart.totalMinutes;
    });
    
    // Find any overlapping schedules
    for (const schedule of sortedSchedules) {
      // Parse existing schedule times
      const existingStart = parseISOTime(schedule.start_time);
      const existingEnd = parseISOTime(schedule.end_time);
      
      // Fix any invalid existing times (where end is before start)
      const validExistingEnd = existingEnd.totalMinutes > existingStart.totalMinutes 
        ? existingEnd 
        : {
            ...existingStart,
            minute: existingStart.minute + schedule.movie.duration,
            hour: existingStart.hour + Math.floor((existingStart.minute + schedule.movie.duration) / 60),
            day: existingStart.day + Math.floor((existingStart.hour + Math.floor((existingStart.minute + schedule.movie.duration) / 60)) / 24),
            totalMinutes: existingStart.totalMinutes + schedule.movie.duration
          };
      
      // Case 1: Proposed showing starts during an existing showing
      const startsInExistingSlot = proposedStart.totalMinutes >= existingStart.totalMinutes && 
                                  proposedStart.totalMinutes < validExistingEnd.totalMinutes;
      
      // Case 2: Proposed showing ends during an existing showing
      const endsInExistingSlot = proposedEnd.totalMinutes > existingStart.totalMinutes && 
                                proposedEnd.totalMinutes <= validExistingEnd.totalMinutes;
      
      // Case 3: Proposed showing completely overlaps an existing showing
      const completelyOverlapsExisting = proposedStart.totalMinutes <= existingStart.totalMinutes && 
                                        proposedEnd.totalMinutes >= validExistingEnd.totalMinutes;
      
      if (startsInExistingSlot || endsInExistingSlot || completelyOverlapsExisting) {
        // Log the conflict for debugging
        console.log("Conflict detected:", {
          schedule_id: schedule.schedule_id,
          movie: schedule.movie.name,
          proposed: { 
            start: startTime, 
            end: endTime,
            startMinutes: proposedStart.totalMinutes,
            endMinutes: proposedEnd.totalMinutes
          },
          existing: { 
            start: schedule.start_time, 
            end: schedule.end_time,
            startMinutes: existingStart.totalMinutes,
            endMinutes: validExistingEnd.totalMinutes
          },
          startsInExistingSlot,
          endsInExistingSlot,
          completelyOverlapsExisting
        });
        
        return { hasConflict: true, conflictDetails: schedule };
      }
    }
    
    // No conflicts found
    return { hasConflict: false, conflictDetails: null };
  };
  
  // Utility function for debugging time issues
  export const debugDateTime = (dateString) => {
    if (!dateString) return 'Invalid date';
    
    try {
      const parsed = parseISOTime(dateString);
      const jsDate = new Date(dateString);
      
      return {
        original: dateString,
        parsed,
        jsDate: jsDate.toString(),
        jsLocalISO: jsDate.toISOString(),
        jsTimestamp: jsDate.getTime()
      };
    } catch (err) {
      return `Error parsing: ${err.message}`;
    }
  };