#!/bin/bash

echo "🛑 Đang tắt dự án Kubernetes..."

# Xóa các resources
echo "Đang xóa các services, deployments và resources khác..."
kubectl delete service --all
kubectl delete deployment --all
kubectl delete statefulset --all
kubectl delete configmap --all --ignore-not-found=true
kubectl delete secret --all --ignore-not-found=true
kubectl delete ingress --all --ignore-not-found=true
kubectl delete jobs --all

# Hỏi người dùng có muốn giữ lại dữ liệu không
read -p "Bạn có muốn giữ lại dữ liệu? (y/n): " keep_data
if [[ $keep_data == "n" || $keep_data == "N" ]]; then
  echo "Đang xóa tất cả PVCs..."
  kubectl delete pvc --all
  echo "Đã xóa tất cả dữ liệu."
else
  echo "Đã giữ lại PVCs và dữ liệu."
fi

# Hỏi người dùng có muốn dừng Minikube không
read -p "Bạn có muốn dừng Minikube? (y/n): " stop_minikube
if [[ $stop_minikube == "y" || $stop_minikube == "Y" ]]; then
  echo "Đang dừng Minikube..."
  minikube stop
  echo "Đã dừng Minikube."
fi

echo "✅ Đã tắt dự án thành công!"