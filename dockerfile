# Dockerfile

FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD npx prisma migrate deploy && npm run start:prod
