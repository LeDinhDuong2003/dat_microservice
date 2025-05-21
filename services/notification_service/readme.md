# Notification Service

## Overview
Notification Service xử lý việc gửi thông báo qua email khi lịch chiếu phim được tạo, cập nhật hoặc xóa. Service này lắng nghe các sự kiện từ RabbitMQ và gửi email thông báo tương ứng.

## Setup
- Xây dựng sử dụng `Dockerfile` được cung cấp.
- Mã nguồn nằm trong thư mục `src/`.
- Kết nối với RabbitMQ để nhận các sự kiện.
- Sử dụng Nodemailer để gửi email thông qua dịch vụ Gmail.

## Development
- Chạy cục bộ thông qua `docker-compose up --build` từ thư mục gốc.
- Áp dụng Kubernetes: `kubectl apply -f k8s/messaging/rabbitmq.yaml` và `kubectl apply -f k8s/backend/notification-service.yaml`.

## Message Types
- `schedule.created` - Lịch chiếu phim mới đã được tạo
- `schedule.updated` - Lịch chiếu phim đã được cập nhật
- `schedule.deleted` - Lịch chiếu phim đã bị xóa