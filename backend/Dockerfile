FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json .

COPY prisma ./prisma

COPY prisma.config.ts ./   

RUN npm ci

RUN npx prisma generate

COPY . .

RUN npm run build


FROM node:24-alpine AS runner

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# @prisma/client requires .prisma/client/ (CJS generated files) at runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["node", "dist/src/main.js"]



