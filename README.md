# Seasoned

Personal TV watch history stored as an end-to-end encrypted file in Proton Drive.

## Setup

1. Install the [official Proton Drive CLI](https://proton.me/blog/proton-drive-cli).
2. Copy `.env.example` to `.env` and set `TMDB_ACCESS_TOKEN`.
3. Generate `PROTON_SESSION_SECRET` with `openssl rand -hex 32`.
4. Set `PROTON_DRIVE_CLI_PATH` if `proton-drive` is not on `PATH`.
5. Run `pnpm install && pnpm dev`.

Signing in opens Proton's own browser login. Seasoned stores only an encrypted CLI session on the server; watch history lives at `/my-files/watch-history.json` in the user's Proton Drive.

## Docker

The image includes Proton Drive CLI 0.6.0 and supports `linux/amd64` and `linux/arm64`.

```sh
docker build --tag seasoned .
docker volume create seasoned-proton-sessions
docker run --rm --publish 3000:3000 \
  --volume seasoned-proton-sessions:/data/proton-sessions \
  --env TMDB_ACCESS_TOKEN=your_tmdb_token \
  --env PROTON_SESSION_SECRET=your_generated_secret \
  seasoned
```

Open `http://localhost:3000`. Keep `PROTON_SESSION_SECRET` unchanged between runs or existing sessions cannot be decrypted.
