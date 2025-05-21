FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

# Copy toàn bộ thư mục src và các file khác
COPY src/ ./src/
COPY .env ./

EXPOSE 3003

# Sửa lại lệnh start để trỏ đến file app.js trong thư mục src
CMD ["npm", "start"]