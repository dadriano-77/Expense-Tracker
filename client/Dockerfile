FROM node:22-alpine AS build
WORKDIR /app
# Build context is repo root — copy workspace manifests so npm ci can resolve the lockfile
COPY package.json package-lock.json ./
COPY client/package.json ./client/
RUN npm ci --workspace=client
COPY client/ ./client/
RUN npm run build --workspace=client

FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
