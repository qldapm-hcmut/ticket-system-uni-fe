FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_ENABLE_DEV_LOGIN=false
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_BASE_URL=/api/v1
ENV VITE_ENABLE_DEV_LOGIN=$VITE_ENABLE_DEV_LOGIN
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

FROM nginx:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
