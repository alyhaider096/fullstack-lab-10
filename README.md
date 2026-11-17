# Lab 10 — PostgreSQL and TypeORM with NestJS

## Run

1. Create `task1_db` and `lab10_db` in PostgreSQL.
2. Run `sql/task1.sql` against `task1_db` and `sql/lab10.sql` against a new `lab10_db`. For an older `lab10_db`, run `sql/upgrade-existing.sql` once.
3. Copy `.env.example` to `.env` and set the local PostgreSQL password.
4. Run `npm install`, then `npm run start:dev`. The default URL is `http://localhost:3000/`; set `PORT` to use another port.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/users` | Create user: `{ "name": "A", "email": "a@example.com" }` |
| GET | `/users/:id/stats` | Task 5 Query Builder statistics: totalNotes, pinnedNotes, totalViews |
| GET, POST | `/categories` | List/create categories |
| GET, PATCH, DELETE | `/categories/:id` | Read/update/delete category |
| POST | `/notes` | Create note with `title`, `content`, `userId`, optional `categoryId`, `isPinned`, `tags` |
| PATCH | `/notes/:id` | Change note category or pinned state |
| GET | `/notes?page=2&limit=3&search=nest&tag=lab10&categoryId=1` | Task 6 pagination and filters |
| GET | `/notes/:id` | Get note and increment its views |
| PATCH | `/notes/:id/category` | Set `{ "categoryId": 1 }` or `null` |

The entities use explicit table and column mappings to match the SQL schema. `synchronize` is disabled so startup does not change the database.

## Verification

Run `node scripts/smoke.mjs` while the API is running. It checks success and error responses, views, statistics, sorting, and filtering. `evidence/` contains actual SQL and HTTP test output. The HTTP script creates sample users and notes in `lab10_db`.

## How it works

The controller receives an HTTP request and validates its DTO through the global ValidationPipe. The service uses a TypeORM repository to work with PostgreSQL. Categories use a dedicated module. The note belongs to a user and may belong to a category; the note and tag relationship uses `note_tags`.

Task 5 uses `createQueryBuilder()` with a left join, so users with no notes get zero counts. Task 6 uses case-insensitive title search, optional tag and category filters, pinned-first and newest-first sorting, and database `skip`/`take` pagination. The response includes `data`, `total`, `page`, and `limit`.
