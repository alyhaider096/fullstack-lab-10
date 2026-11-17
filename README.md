# Lab 10 — PostgreSQL and TypeORM with NestJS

## Run

1. Create `task1_db` and `lab10_db` in PostgreSQL.
2. Run `sql/task1.sql` against `task1_db` and `sql/lab10.sql` against `lab10_db`.
3. Copy `.env.example` to `.env` and set the local PostgreSQL password.
4. Run `npm install`, then `npm run start:dev`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/users` | Create user: `{ "name": "A", "email": "a@example.com" }` |
| GET | `/users/:id/stats` | Task 5 Query Builder statistics |
| GET, POST | `/categories` | List/create categories |
| GET, PATCH, DELETE | `/categories/:id` | Read/update/delete category |
| POST | `/notes` | Create note with `title`, `content`, `userId`, optional `categoryId` |
| GET | `/notes?page=1&limit=10&search=word` | Task 6 pagination and search |
| GET | `/notes/:id` | Get note and relationships |
| PATCH | `/notes/:id/category` | Set `{ "categoryId": 1 }` or `null` |

The entities use explicit table and column mappings to match the SQL schema. `synchronize` is disabled so startup does not change the database.
