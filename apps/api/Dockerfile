# Multi-stage so the runtime image carries no build toolchain.
# better-sqlite3 is a native module and needs python3/make/g++ to compile if no
# prebuilt binary matches the platform, hence the builder stage.
FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# The volume is mounted here by fly.toml, so the database survives a redeploy.
ENV DB_PATH=/data/visitors.db
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
# Never run as root.
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
