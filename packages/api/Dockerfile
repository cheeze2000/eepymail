FROM oven/bun:1
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile --production

ENTRYPOINT ["bun", "start"]
