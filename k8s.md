# Hướng dẫn tắt, khởi động lại và khởi tạo lại dữ liệu trong Kubernetes

Bài hướng dẫn này sẽ giúp bạn thực hiện các bước để tắt dự án chạy trên Kubernetes, khởi động lại, và khởi tạo lại dữ liệu với các init job.

## Phần 1: Tắt dự án Kubernetes

### 1. Xóa tất cả các Deployment, Service, và resource khác

```bash
# Xóa các service
kubectl delete service --all

# Xóa các deployment
kubectl delete deployment --all

# Xóa các statefulset (nếu có)
kubectl delete statefulset --all

# Xóa các configmap
kubectl delete configmap --all

# Xóa các secret
kubectl delete secret --all

# Xóa các ingress (nếu có)
kubectl delete ingress --all
```

### 2. Giữ lại PersistentVolumeClaims (PVCs) nếu muốn xóa dữ liệu

```bash
# Liệt kê tất cả PVCs
kubectl get pvc

# Xóa tất cả PVCs (sẽ xóa dữ liệu)
kubectl delete pvc --all
```

### 3. Tạm dừng Minikube (tuỳ chọn)

```bash
# Hoặc dừng hoàn toàn Minikube
minikube stop
```

## Phần 3: Khởi động lại dự án

### 1. Bật Minikube

```bash
# Khởi động Minikube nếu đã dừng
minikube start
```

### 2. Tạo lại các Secret và ConfigMap

```bash
# Tạo lại các Secret và ConfigMap
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/config.yaml

# Tạo lại các PVC
kubectl apply -f k8s/databases/movie-db-pvc.yaml
kubectl apply -f k8s/databases/location-db-pvc.yaml
kubectl apply -f k8s/databases/schedule-db-pvc.yaml
kubectl apply -f k8s/messaging/rabbitmq-pvc.yaml
```

### 3. Triển khai các Database

```bash
# Triển khai các cơ sở dữ liệu
kubectl apply -f k8s/databases/movie-db.yaml
kubectl apply -f k8s/databases/location-db.yaml
kubectl apply -f k8s/databases/schedule-db.yaml
```

### 4. Kiểm tra Database đã sẵn sàng

```bash
# Kiểm tra các Pod database đã sẵn sàng chưa
kubectl get pods -l app=movie-db
kubectl get pods -l app=location-db
kubectl get pods -l app=schedule-db

# Đợi cho tất cả Pod ở trạng thái Running
kubectl wait --for=condition=Ready pod -l app=movie-db --timeout=120s
kubectl wait --for=condition=Ready pod -l app=location-db --timeout=120s
kubectl wait --for=condition=Ready pod -l app=schedule-db --timeout=120s
```

### 5. Chạy các Init Job

```bash
# Reset và khởi tạo dữ liệu
kubectl apply -f k8s/init/location-db-reset-job.yaml
kubectl apply -f k8s/init/location-db-init-job.yaml
kubectl apply -f k8s/init/movie-db-init-job.yaml
kubectl apply -f k8s/init/schedule-db-init-job.yaml

# Theo dõi trạng thái các Job
kubectl get jobs
```

### 6. Triển khai các service còn lại

```bash
# Triển khai RabbitMQ
kubectl apply -f k8s/messaging/rabbitmq.yaml

# Triển khai các backend service
kubectl apply -f k8s/backend/movie-service.yaml
kubectl apply -f k8s/backend/location-service.yaml
kubectl apply -f k8s/backend/schedule-service.yaml
kubectl apply -f k8s/backend/notification-service.yaml
kubectl apply -f k8s/backend/api-gateway.yaml

# Triển khai frontend
kubectl apply -f k8s/frontend/frontend.yaml
```

```bash
# chạy api-gateway ở 3003
kubectl port-forward svc/api-gateway 3003:3003


kubectl port-forward svc/frontend 3005:3005
```

```bash
minikube dashboard
```