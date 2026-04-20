FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./
RUN npm install --omit=dev

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node src/index.js"]