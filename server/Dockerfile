FROM oven/bun:1.3-alpine AS base
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY tsconfig.json ./
COPY src ./src

ENV PORT=3001
ENV CORS_ORIGIN=http://localhost:3000
EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
