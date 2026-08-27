-- Initialise the application database schema
-- This file is run automatically when the PostgreSQL container
-- is first created (mounted to /docker-entrypoint-initdb.d/)

CREATE TABLE IF NOT EXISTS visitors (
  id         SERIAL PRIMARY KEY,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
