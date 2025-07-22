# Dockerfile

# ใช้ Node 18
FROM node:18

# สร้าง working directory
WORKDIR /usr/src/app

# ติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอกโค้ดทั้งหมด รวม prisma ด้วย
COPY . .

# สร้าง Prisma Client (สำคัญมาก!)
RUN npx prisma generate

# สร้าง NestJS (ถ้าใช้ TypeScript)
RUN npm run build

# เปิดพอร์ต 3001 (ตาม .env)
EXPOSE 3001

# migrate DB และเริ่มแอป
CMD npx prisma migrate deploy && npm run start:prod
