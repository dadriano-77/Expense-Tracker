FROM node:22-alpine
WORKDIR /app
# Build context is repo root — copy workspace manifests so npm ci can resolve the lockfile
COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci --omit=dev --workspace=server
COPY server/src/ ./server/src/
EXPOSE 3001
CMD ["node", "--experimental-sqlite", "server/src/server.js"]
