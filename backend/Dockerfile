# Build native dependencies (better-sqlite3) in a separate stage.
FROM node:20-bookworm-slim AS dependencies

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Runtime stage ----------
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    DATA_DIR=/data

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

RUN mkdir -p /data

EXPOSE 4000

CMD ["node", "src/server.js"]
