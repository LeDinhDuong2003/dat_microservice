# 🧩 Microservices Assignment Starter Template

This repository is a **starter template** for building a microservices-based system. Use it as a base for your group assignment.

---

## 📁 Folder Structure

```
microservices-assignment-starter/
├── README.md                       # This instruction file
├── .env.example                    # Example environment variables
├── docker-compose.yml              # Multi-container setup for all services
├── docs/                           # Documentation folder
│   ├── architecture.md             # Describe your system design here
│   ├── analysis-and-design.md      # Document system analysis and design details
│   ├── asset/                      # Store images, diagrams, or other visual assets for documentation
│   └── api-specs/                  # API specifications in OpenAPI (YAML)
│       ├── service-a.yaml
│       └── service-b.yaml
├── scripts/                        # Utility or deployment scripts
│   └── init.sh
├── services/                       # Application microservices
│   ├── service-a/
│   │   ├── Dockerfile
│   │   └── src/
│   │   └── readme.md               # Service A instructions and description
│   └── service-b/
│       ├── Dockerfile
│       └── src/
│   │   └── readme.md               # Service B instructions and description
└── gateway/                        # API Gateway / reverse proxy
    ├── Dockerfile
    └── src/


```

---

## 🚀 Getting Started

1. **Clone this repository**

   ```bash
   git clone https://github.com/hungdn1701/microservices-assignment-starter.git
   cd microservices-assignment-starter
   ```

2. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

3. **Run with Docker Compose**

   ```bash
   docker-compose up --build
   ```
---

## 🧪 Development Notes

- Use `docs/api-specs/*.yaml` to document REST APIs using OpenAPI format (Swagger).

---

## 📚 Recommended Tasks
- [ ] Document system analysis and design in `analysis-and-design.md` as the first step
- [ ] Update `architecture.md` to describe your system components.
- [ ] Define all APIs using OpenAPI YAML in `docs/api-specs/`.
- [ ] Implement business logic in `service-a` and `service-b`.
- [ ] Configure API Gateway
- [ ] Ensure services can communicate internally using service names (Docker Compose handles networking).

---

## 📌 Notes

- Use Git branches for team collaboration.
- Commit early, commit often!

---

## 👩‍🏫 Assignment Submission

Please make sure:
- `README.md` is updated with service descriptions and API usage, following standard README conventions (e.g., clear structure, usage instructions, and contribution guidelines).
- Include a list of team members and their contributions in the `README.md`.
- All your code should be **runnable with one command**: `docker-compose up`.



## Author

This template was created by Hung Dang.
- Email: hungdn@ptit.edu.vn
- GitHub: hungdn1701


Good luck! 💪🚀



# Cinema Management System

Hệ thống quản lý rạp chiếu phim với kiến trúc microservices, hỗ trợ quản lý lịch chiếu và thông báo qua email.

## Cấu trúc dự án

```
cinema-management/
├── services/
│   ├── movie_service/       # Quản lý thông tin phim
│   ├── location_service/    # Quản lý rạp và phòng chiếu
│   ├── schedule_service/    # Quản lý lịch chiếu
│   └── notification_service/# Gửi email thông báo
├── gateway/                 # API Gateway
├── frontend/                # Frontend application
├── docker-compose.yml       # Cấu hình Docker Compose
└── README.md                # Tài liệu hướng dẫn
```

## Yêu cầu hệ thống

- Docker và Docker Compose
- Node.js (v14+)

## Hướng dẫn cài đặt với Docker

### 1. Clone repository

```bash
git clone https://github.com/jnp2018/mid-project-220532075.git
cd mid-project-220532075
```

### 2. Cài đặt dependencies cho mỗi service

```bash
# Cài đặt dependencies cho movie_service
cd services/movie_service
npm install

# Cài đặt dependencies cho location_service
cd ../location_service
npm install

# Cài đặt dependencies cho schedule_service
cd ../schedule_service
npm install

# Cài đặt dependencies cho notification_service
cd ../notification_service
npm install

# Cài đặt dependencies cho gateway
cd ../../gateway
npm install

# Cài đặt dependencies cho frontend
cd ../frontend
npm install

# Quay lại thư mục gốc
cd ../..
```

### 3. Cấu hình biến môi trường

Sao chép từng file .env.example thành .env trong mỗi service:

```bash
cd services/movie_service
cp .env.example .env
cd ../location_service
cp .env.example .env
cd ../schedule_service
cp .env.example .env
cd ../notification_service
cp .env.example .env
cd ../../gateway
cp .env.example .env
cd ../..
```


### 4. Tạo thư mục logs

```bash
mkdir -p services/movie_service/logs
mkdir -p services/location_service/logs
mkdir -p services/schedule_service/logs
mkdir -p services/notification_service/logs
mkdir -p services/gateway/logs
```

## Chạy ứng dụng

### Sử dụng Docker Compose

```bash
# Build và khởi động tất cả services
docker-compose up -d --build

# Kiểm tra trạng thái các containers
docker-compose ps

# Xem logs từ tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f service_name  # Ví dụ: movie_service

# Dừng tất cả services
docker-compose down
```

### Truy cập các services

- Movie Service: http://localhost:3000
- Location Service: http://localhost:3001
- Schedule Service: http://localhost:3002
- API Gateway: http://localhost:3003
- Frontend: http://localhost:3005



## Chi tiết các Microservices

### Movie Service

Service quản lý thông tin phim bao gồm tên, thể loại, thời lượng, mô tả, trạng thái và hình ảnh.

### Location Service

Service quản lý thông tin:
- Rạp phim: tên, địa chỉ, mô tả
- Phòng chiếu: tên, số ghế, loại phòng, mô tả
- Ghế: tên ghế, loại ghế (thường, VIP)

### Schedule Service

Service quản lý lịch chiếu phim tại các phòng, bao gồm thời gian bắt đầu, kết thúc và giá vé.

### Notification Service

Service gửi email thông báo khi có thao tác tạo mới, cập nhật, hoặc xóa lịch chiếu. Sử dụng RabbitMQ để nhận events.

### API Gateway

Đóng vai trò cổng vào duy nhất cho tất cả các API, hỗ trợ định tuyến, xác thực và bảo mật.

## Khắc phục sự cố

### RabbitMQ không kết nối

Kiểm tra xem RabbitMQ container đã chạy thành công chưa:
```bash
docker ps | grep rabbitmq
```

Nếu không thấy RabbitMQ container, khởi động lại:
```bash
docker-compose up -d rabbitmq
```

### Không nhận được email thông báo

- Kiểm tra log của notification_service:
```bash
docker-compose logs notification_service
```

- Xác nhận cấu hình email trong file `.env` của notification_service:
  - `EMAIL_USER`: Gmail address
  - `EMAIL_PASSWORD`: App password (không phải mật khẩu đăng nhập)
  - `EMAIL_TO`: Email người nhận

- Đảm bảo đã bật "Less secure app access" trong tài khoản Gmail hoặc sử dụng App Password

### Service không kết nối được với database

Kiểm tra cấu hình kết nối database trong service:
```bash
docker-compose logs service_name  # Thay service_name bằng tên service gặp vấn đề
```

# Hướng dẫn cài đặt với k8s

## Cài đặt
- Docker
- kubectl
- Minikube


## Chạy dự án (macOS/Linux)
```bash
## Cấp quyền thực thi cho scripts (macOS/Linux)
chmod +x scripts/startup.sh scripts/shutdown.sh

# Để khởi động dự án: 
./scripts/startup.sh

# Để tắt dự án: 
./scripts/shutdown.sh
```


## Chạy dự án (Win)
```bash
# Mở Git Bash và điều hướng đến thư mục dự án, sau đó:
bash scripts/startup.sh

# Để tắt dự án
bash scripts/shutdown.sh
```

## Chạy frontend
```bash
minikube service frontend --url

# Hoặc chạy ở port = 3005
kubectl port-forward svc/frontend 3005:3005
```