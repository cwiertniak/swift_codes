FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm install csv-parser

EXPOSE 8080

CMD ["npm", "start"]