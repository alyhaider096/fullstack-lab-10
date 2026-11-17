-- Upgrade the earlier Lab 10 database without deleting existing notes.
ALTER TABLE categories ALTER COLUMN name TYPE varchar(30);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;
