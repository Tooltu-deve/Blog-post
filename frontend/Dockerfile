# Stage 1: Build the React SPA
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

# VITE_* are baked into the JS bundle at build time (import.meta.env).
# Pass via: docker build --build-arg VITE_API_URL=... --build-arg VITE_COGNITO_...
ARG VITE_API_URL
ARG VITE_COGNITO_USER_POOL_ID
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_DOMAIN
ENV VITE_API_URL=$VITE_API_URL \
    VITE_COGNITO_USER_POOL_ID=$VITE_COGNITO_USER_POOL_ID \
    VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID \
    VITE_COGNITO_DOMAIN=$VITE_COGNITO_DOMAIN

RUN npm run build


# Stage 2: Serve with nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
