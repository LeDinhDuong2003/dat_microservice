# Location Service

## Overview
Location Service quản lý thông tin liên quan đến rạp chiếu phim, phòng chiếu, và ghế ngồi. Service này cung cấp API để tạo, đọc, cập nhật và xóa thông tin về địa điểm.

## Setup
- Xây dựng sử dụng `Dockerfile` được cung cấp.
- Mã nguồn nằm trong thư mục `src/`.
- Sử dụng cơ sở dữ liệu PostgreSQL để lưu trữ dữ liệu.

## Development
- Define APIs in `docs/api-specs/location-service.yaml`.
- Chạy cục bộ thông qua `docker-compose up --build` từ thư mục gốc.
- Áp dụng Kubernetes: `kubectl apply -f k8s/databases/location-db.yaml` và `kubectl apply -f k8s/backend/location-service.yaml`.

## Endpoints
- Base URL: `http://localhost:3001/`
- Các endpoint chính:
  - `/cinemas` - Quản lý rạp chiếu phim
  - `/cinemas/:cinemaId/rooms` - Lấy danh sách phòng của một rạp
  - `/rooms` - Quản lý phòng chiếu
  - `/rooms/:id` - Lấy chi tiết của một phòng chiếu
  - `/seats` - Quản lý ghế ngồi
  - `/rooms/:roomId/seats` - Lấy danh sách ghế của một phòng

## Database Schema
- **cinemas**: id, name, address, description
- **rooms**: id, cinema_id, name, seats, description, type
- **seats**: id, room_id, name, type