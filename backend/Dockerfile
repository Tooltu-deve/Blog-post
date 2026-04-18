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

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Prisma: client binaries for runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Prisma: schema + migrations for `prisma migrate deploy` (ECS Run Task)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Remove non-ARM64 engine binaries to reduce image size
RUN find node_modules/.prisma -name 'libquery_engine-*' ! -name '*arm64*' -delete 2>/dev/null; \
    find node_modules/.prisma -name 'libschema_engine-*' ! -name '*arm64*' -delete 2>/dev/null; \
    true

# Official image includes unprivileged `node` (uid 1000); run process as non-root
RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/src/main.js"]



