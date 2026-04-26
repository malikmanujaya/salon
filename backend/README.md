# Lumora — Backend

Salon management REST API built with **NestJS 10**, **Prisma** and **MySQL**.

## Stack

- NestJS 10 (modular, tenant-aware)
- Prisma 5 (`prisma/schema.prisma` is the source of truth)
- MySQL 8+
- JWT auth (access + refresh)
- Swagger at `/api/docs` in development
- `helmet` + global validation pipe + CORS

## Prerequisites

- Node.js 20+
- A reachable MySQL 8 instance

## Getting started

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if your MySQL credentials differ from the defaults
# (root / rootpassword / localhost:3306 / database "salon")

# Make sure the database exists
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS salon CHARACTER SET utf8mb4;"

# (one-time) generate the Prisma client + apply the schema
npm run prisma:generate
npm run prisma:migrate -- --name init

# Start dev server with hot reload + schema watcher
npm run start:dev
```

### Environment variables

The backend reads database credentials in **two compatible formats**:

| Var          | Example                                          |
| ------------ | ------------------------------------------------ |
| `DB_HOST`    | `localhost`                                      |
| `DB_PORT`    | `3306`                                           |
| `DB_USER`    | `root`                                           |
| `DB_PASSWORD`| `rootpassword`                                   |
| `DB_NAME`    | `salon`                                          |
| `DATABASE_URL` | `mysql://root:rootpassword@localhost:3306/salon` |

The Prisma CLI (`prisma generate`, `prisma migrate`) only reads `DATABASE_URL`,
so always keep that line in `.env` in sync with the individual `DB_*` values.

The API listens on [http://localhost:4000/api](http://localhost:4000/api).
Swagger docs are at [http://localhost:4000/api/docs](http://localhost:4000/api/docs).
The health endpoint is at `GET /api/health`.

## Schema-driven hot reload

`npm run start:dev` runs **two watchers in parallel**:

1. `nest start --watch` — incremental TypeScript rebuild + restart for any file
   in `src/`.
2. `chokidar prisma/schema.prisma` — when the schema changes, it runs
   `prisma generate` and then **touches `src/main.ts`** so the Nest watcher
   picks up the new client and restarts.

Net effect: edit `prisma/schema.prisma`, save — within a second or two the
server is back up with the new types. No manual restart needed.

## Scripts

| Script                  | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `npm run start:dev`     | Dev mode with hot reload + schema watcher                |
| `npm run start`         | One-off start (no watch)                                 |
| `npm run build`         | Build to `dist/`                                         |
| `npm run start:prod`    | Run the compiled build                                   |
| `npm run prisma:generate`| Regenerate the Prisma client                            |
| `npm run prisma:migrate`| Create + apply a migration (interactive)                 |
| `npm run prisma:studio` | Browse the DB in Prisma Studio                           |
| `npm run lint`          | ESLint                                                   |
| `npm run test`          | Jest                                                     |

## Project layout

```
backend/
├── prisma/
│   └── schema.prisma       # Source of truth for the database
├── scripts/
│   └── touch-main.js       # Triggers Nest restart after schema sync
├── src/
│   ├── config/             # ConfigModule + validation
│   ├── prisma/             # Global PrismaService
│   ├── health/             # /api/health
│   ├── app.module.ts
│   └── main.ts             # Bootstrap: helmet, CORS, validation, Swagger
└── package.json
```

## Adding a feature module

1. Edit `prisma/schema.prisma` (server auto-restarts).
2. `npm run prisma:migrate -- --name <change>` to create a migration.
3. `nest g module <name>` and `nest g service <name>` to scaffold a module.
4. Inject `PrismaService` (it is global) and you are off to the races.
