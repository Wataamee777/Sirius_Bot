FROM oven/bun:1.3.14-slim

LABEL org.opencontainers.image.source="https://github.com/oruger-0730/Sirius_Bot"
LABEL org.opencontainers.image.title="SiriusBot"

ENV DATABASE_URL="mysql://dummy:dummy@dummy:3306/dummy"

WORKDIR /app

COPY package*.json ./
COPY bun.lock ./

RUN bun install --frozen-lockfile

COPY . .


RUN bunx prisma generate

USER bun

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run src/index.ts"]
