# Lab 10 screenshot checklist

Capture real pgAdmin, psql, and Postman windows. Keep the database or request URL,
status code, and result visible. Save PNGs in this folder.

1. `01-postgres-version.png`: `SELECT version();` in psql.
2. `02-pgadmin-server.png`: PostgreSQL 18 connected in pgAdmin.
3. `03-task1-queries.png`: ordered, filtered, updated, deleted, and grouped course query outputs.
4. `04-task1-check.png`: rejected 9-credit-hours insertion.
5. `05-notes-schema.png`: `\dt` and `\d notes` from `lab10_db`.
6. `06-category-success.png`: Postman category creation and list.
7. `07-category-errors.png`: duplicate-name 409 and missing-ID 404.
8. `08-note-category.png`: note creation and category association.
9. `09-note-views.png`: three consecutive GET responses showing increasing `views`.
10. `10-user-stats.png`: populated user and zero-note user statistics.
11. `11-pagination-search.png`: page 2, title search, tag filter, category filter.
12. `12-validation.png`: `limit=100` and `page=0` returning 400.

The Postman collection in `../postman/` contains the API requests in run order.
