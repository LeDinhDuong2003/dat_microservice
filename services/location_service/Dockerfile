FROM node:18

WORKDIR /app

COPY package*.json ./
COPY .env .env

# ⚠️ Thêm dòng này để cài luôn devDependencies
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
