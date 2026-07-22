FROM debian:bookworm-slim AS proton-cli

ARG TARGETARCH

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

RUN case "$TARGETARCH" in \
    amd64) platform=linux-x64; checksum=e77f5b27a51a81063c23c15ac0a9f07e0ec5c868e78670f34b45b3c3c2e679ed769e6225796b900d0d02735a0c52a21eba72356f3ad617de076c405532e698dc ;; \
    arm64) platform=linux-arm64; checksum=4651d7b23d111a940d5a0d308a62aaf7d39f0d6a8ceba4c6faa2bcd69624557e0eb19f5a528e8d759fb1fcd96c9e094777fabdd218372dee563c6712bd13cdde ;; \
    *) echo "Unsupported architecture: $TARGETARCH" >&2; exit 1 ;; \
  esac \
  && curl --fail --location --output /proton-drive "https://proton.me/download/drive/cli/0.6.0/$platform/proton-drive" \
  && echo "$checksum  /proton-drive" | sha512sum --check - \
  && chmod 0755 /proton-drive

FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN npm install --global pnpm@10.33.2

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-bookworm-slim

ENV NODE_ENV=production \
  PORT=3000 \
  PROTON_DRIVE_CLI_PATH=/usr/local/bin/proton-drive \
  PROTON_SESSION_DIR=/data/proton-sessions

WORKDIR /app

COPY --from=proton-cli /proton-drive /usr/local/bin/proton-drive
COPY --from=build /app/.output ./.output

RUN mkdir --parents /data/proton-sessions \
  && chown node:node /data/proton-sessions

USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
