FROM node:18-alpine

WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --production

# Sao chép mã nguồn
COPY . .

ENV PORT=3005
EXPOSE 3005

CMD ["npm", "start"]