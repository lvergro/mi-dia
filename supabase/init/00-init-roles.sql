-- Supabase roles, schemas and extensions initialization
-- Runs once on first DB container start via docker-entrypoint-initdb.d
-- The supabase/postgres image pre-creates many roles; this script ensures
-- all roles needed by auth, rest, realtime and meta exist.

-- Extensions required by Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"      WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"       WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgjwt"          WITH SCHEMA extensions;

-- Schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS _realtime;
CREATE SCHEMA IF NOT EXISTS storage;

-- Roles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD current_setting('app.pg_password', true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOINHERIT CREATEROLE LOGIN PASSWORD current_setting('app.pg_password', true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOINHERIT CREATEROLE CREATEDB REPLICATION BYPASSRLS LOGIN PASSWORD current_setting('app.pg_password', true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_replication_admin') THEN
    CREATE ROLE supabase_replication_admin REPLICATION LOGIN PASSWORD current_setting('app.pg_password', true);
  END IF;
END
$$;

-- Role hierarchy
GRANT anon        TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role  TO authenticator;

-- Schema grants
GRANT USAGE  ON SCHEMA public     TO anon, authenticated, service_role;
GRANT USAGE  ON SCHEMA extensions TO anon, authenticated, service_role;
GRANT ALL    ON SCHEMA public     TO supabase_admin, postgres;
GRANT ALL    ON SCHEMA auth       TO supabase_auth_admin;
GRANT ALL    ON SCHEMA _realtime  TO postgres;
GRANT ALL    ON SCHEMA realtime   TO postgres;
GRANT ALL    ON SCHEMA storage    TO postgres;

-- Default privileges for future tables in public
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO authenticated;
