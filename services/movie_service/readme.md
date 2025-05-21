# Movie Service

## Overview
Movie Service quản lý thông tin liên quan đến phim. Service này cung cấp API để tạo, đọc, cập nhật và xóa thông tin về phim.

## Setup
- Xây dựng sử dụng `Dockerfile` được cung cấp.
- Mã nguồn nằm trong thư mục `src/`.
- Sử dụng cơ sở dữ liệu PostgreSQL để lưu trữ dữ liệu.

## Development
- Define APIs in `docs/api-specs/movie-service.yaml`.
- Chạy cục bộ thông qua `docker-compose up --build` từ thư mục gốc.
- Áp dụng Kubernetes: `kubectl apply -f k8s/databases/movie-db.yaml` và `kubectl apply -f k8s/backend/movie-service.yaml`.

## Endpoints
- Base URL: `http://localhost:3000/`
- Các endpoint chính:
  - `/movies` - Lấy danh sách phim/tạo phim mới
  - `/movies?name=keyword` - Tìm kiếm phim theo tên
  - `/movies/:id` - Lấy chi tiết một phim

## Database Schema
- **movies**: id, name, img, genre, label, duration, description, status