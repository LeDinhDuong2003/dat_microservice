# Schedule Service

## Overview
Schedule Service quản lý lịch chiếu phim, bao gồm thời gian chiếu và giá vé. Service này cung cấp API để tạo, đọc, cập nhật và xóa lịch chiếu, đồng thời tương tác với Movie Service và Location Service để cung cấp thông tin đầy đủ.

## Setup
- Xây dựng sử dụng `Dockerfile` được cung cấp.
- Mã nguồn nằm trong thư mục `src/`.
- Sử dụng cơ sở dữ liệu PostgreSQL để lưu trữ dữ liệu.
- Kết nối với RabbitMQ để phát sự kiện khi lịch chiếu được tạo, cập nhật hoặc xóa.

## Development
- Define APIs in `docs/api-specs/schedule-service.yaml`.
- Chạy cục bộ thông qua `docker-compose up --build` từ thư mục gốc.
- Áp dụng Kubernetes: `kubectl apply -f k8s/databases/schedule-db.yaml` và `kubectl apply -f k8s/backend/schedule-service.yaml`.

## Endpoints
- Base URL: `http://localhost:3002/`
- Các endpoint chính:
  - `/schedules` - Quản lý lịch chiếu phim
  - `/schedules/:id` - Lấy chi tiết lịch chiếu
  - `/schedules/with-movies` - Lấy lịch chiếu kèm thông tin phim
  - `/schedules/:id/with-movie` - Lấy chi tiết lịch chiếu kèm thông tin phim
  - `/schedules/filtered` - Lọc và phân trang lịch chiếu
  - `/schedules/room/:roomId` - Lấy lịch chiếu theo phòng

## Database Schema
- **schedules**: id, movie_id, room_id, start_time, end_time, normal_seat_price, vip_seat_price

## External Dependencies
- Movie Service: Để lấy thông tin phim
- Location Service: Để lấy thông tin phòng chiếu và rạp
- RabbitMQ: Để gửi thông báo khi lịch chiếu thay đổi