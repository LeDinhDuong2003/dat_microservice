#!/bin/bash

echo "🚀 Đang khởi động dự án Kubernetes..."

# Kiểm tra trạng thái Minikube
minikube_status=$(minikube status -f '{{.Host}}' 2>/dev/null)
if [[ "$minikube_status" != "Running" ]]; then
  echo "Đang khởi động Minikube..."
  minikube start
  echo "Đã khởi động Minikube."
fi

# Tạo lại các ConfigMap và Secret
echo "Đang tạo các ConfigMap và Secret..."
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/config.yaml

# Tạo lại các PVC (nếu chưa tồn tại)
echo "Đang kiểm tra và tạo PVCs..."
kubectl apply -f k8s/databases/movie-db-pvc.yaml
kubectl apply -f k8s/databases/location-db-pvc.yaml
kubectl apply -f k8s/databases/schedule-db-pvc.yaml
kubectl apply -f k8s/messaging/rabbitmq-pvc.yaml

# Triển khai các Database
echo "Đang triển khai các Database..."
kubectl apply -f k8s/databases/movie-db.yaml
kubectl apply -f k8s/databases/location-db.yaml
kubectl apply -f k8s/databases/schedule-db.yaml

# Đợi cho các Database sẵn sàng
echo "Đang đợi các Database sẵn sàng..."

# Phương pháp mạnh hơn để đợi database sẵn sàng
wait_for_db() {
  local db_name=$1
  local max_attempts=30
  local attempt=0
  local sleep_time=5
  
  echo "Đang đợi $db_name khởi động..."
  
  # Đợi cho pod chạy trước
  while [[ $attempt -lt $max_attempts ]]; do
    # Kiểm tra pod có tồn tại và đang chạy
    pod_status=$(kubectl get pod -l app=$db_name -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
    
    if [[ "$pod_status" == "Running" ]]; then
      echo "$db_name đã chạy. Kiểm tra container sẵn sàng..."
      
      # Kiểm tra tất cả container trong pod đã sẵn sàng
      ready_status=$(kubectl get pod -l app=$db_name -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null)
      
      if [[ "$ready_status" == "true" ]]; then
        echo "$db_name đã sẵn sàng hoàn toàn!"
        return 0
      fi
    fi
    
    echo "Đang đợi $db_name sẵn sàng... (lần thử $attempt/$max_attempts)"
    sleep $sleep_time
    ((attempt++))
  done
  
  echo "Đã hết thời gian chờ cho $db_name, tiếp tục thực hiện script..."
  return 1
}

# Đợi từng database
wait_for_db "movie-db"
wait_for_db "location-db"
wait_for_db "schedule-db"

# Thêm thời gian nghỉ để đảm bảo database thực sự sẵn sàng cho kết nối
echo "Đợi thêm 15 giây để database khởi động hoàn toàn..."
sleep 15

# Hỏi người dùng có muốn khởi tạo lại dữ liệu không
read -p "Bạn có muốn khởi tạo lại dữ liệu? (y/n): " init_data
if [[ $init_data == "y" || $init_data == "Y" ]]; then
  echo "Đang chạy các Init Job..."
  kubectl apply -f k8s/init/location-db-reset-job.yaml
  kubectl apply -f k8s/init/location-db-init-job.yaml
  kubectl apply -f k8s/init/movie-db-init-job.yaml
  kubectl apply -f k8s/init/schedule-db-init-job.yaml
  
  echo "Đang đợi các Init Job hoàn thành..."
  kubectl wait --for=condition=complete job -l type=init-job --timeout=180s
fi

# Triển khai RabbitMQ và các service
echo "Đang triển khai RabbitMQ..."
kubectl apply -f k8s/messaging/rabbitmq.yaml

echo "Đang triển khai các backend service..."
kubectl apply -f k8s/backend/movie-service.yaml
kubectl apply -f k8s/backend/location-service.yaml
kubectl apply -f k8s/backend/schedule-service.yaml
kubectl apply -f k8s/backend/notification-service.yaml
kubectl apply -f k8s/backend/api-gateway.yaml

echo "Đang triển khai frontend..."
kubectl apply -f k8s/frontend/frontend.yaml

# Hiển thị thông tin các service
echo "Đang lấy thông tin các service..."
kubectl get pods
kubectl get services

# Hỏi người dùng có muốn port-forward API Gateway không
read -p "Bạn có muốn port-forward API Gateway tới cổng 3003? (y/n): " port_forward
if [[ $port_forward == "y" || $port_forward == "Y" ]]; then
  echo "Đang chạy port-forward cho API Gateway..."
  kubectl port-forward svc/api-gateway 3003:3003 &
  echo "API Gateway có thể truy cập tại: http://localhost:3003"
fi

echo "✅ Dự án đã được khởi động thành công!"