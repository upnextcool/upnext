# Upnext

Collaborative Spotify queue for parties. The host connects a Spotify account, guests
join with a 4-digit code, add songs, and vote on what plays next — the highest-scored
song is queued into the host's Spotify playback automatically.

## Repository layout

This is an Nx monorepo with two packages:

| Package | Stack | Description |
| --- | --- | --- |
| `packages/server` | Express, Apollo Server, TypeGraphQL, TypeORM (Postgres) | GraphQL API, Spotify integration, party state machine |
| `packages/front` | Vue 2, Vuetify, vue-apollo | Mobile-first PWA client |

## Development

Requires **Node >= 20.11.1** (Node 20 or 22 LTS; pinned in `.nvmrc`). The
GraphQL stack (type-graphql 2) uses `node:`-prefixed imports, so older Node
versions fail at server startup with `Cannot find module 'node:path'`.

```sh
yarn install
yarn start:server   # nx serve server
yarn start:front    # nx serve front
```

The server reads configuration from a `.env` file in the repo root (see
`packages/server/src/environment.ts` for the full list): database connection
(`DATABASE_*`), Spotify app credentials (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`,
`SPOTIFY_REDIRECT_URI`), app basics (`APP_HOST`, `APP_PORT`, `APP_KEY`, `APP_SCHEMA`,
`APP_PUBLIC_URL`, `API_ROUTE`), GraphQL (`GRAPHQL_ENABLED`, `GRAPHQL_ROUTE`), and
frontend pointers (`FRONT_URL`, `FRONT_VERSION`).

## How real-time updates work

- Clients talk GraphQL over HTTP for queries/mutations and a websocket for
  subscriptions. The websocket is authenticated once at connect time via
  `connectionParams.Authorization` (the member JWT issued on join).
- All pubsub payloads carry the `partyId` they belong to, and every subscription is
  filtered server-side so members only receive events for their own party.
- A cron job polls Spotify once per second per active party to drive the party state
  machine (new song / playing / paused / scrubbing / queue-next). Ticks are guarded so
  a slow Spotify response can't stack overlapping polls for the same party.

## Scaling notes

The server currently assumes a **single instance**:

- `PartyStateService` keeps party playback state in in-process maps (pruned as parties
  disappear, but still per-process).
- The Apollo `PubSub` engine is in-memory, so subscription events only reach clients
  connected to the process that published them.

To run multiple instances, swap the in-memory `PubSub` for a shared backend (e.g.
`graphql-redis-subscriptions`) and move party state into Redis/Postgres — both are
isolated behind `UpNextPubSubEngine` and `PartyStateService`, so the swap is localized.
TypeORM runs with `synchronize: true`; before scaling to real production traffic,
switch to explicit migrations.
