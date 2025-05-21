FROM node:18

WORKDIR /app

COPY package*.json ./
COPY .env .env


RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]
