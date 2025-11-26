# Database Self-Repair Status (Supabase)

## Why the requested live self-repair cannot be executed now
- The task requires **live introspection of the Supabase/PostgreSQL instance** (tables, columns, defaults, constraints, indexes, views, materialized views, and enums) to produce a zero-guess migration.
- The repository does **not contain database credentials, connection strings, or a running Supabase container with data**. The local `supabase/config.toml` only defines ports/project id for a dev stack but provides no data or access token.
- Running `supabase db dump`/`psql` against the cloud project or a seeded local container is not possible without credentials or a populated local database.

## What is required to proceed safely (no guessing)
1. Provide one of the following:
   - Supabase service role connection string (or `SUPABASE_DB_URL`) with permission to read schema metadata, **or**
   - A **current schema dump** (`supabase db dump -f schema.sql`) from the target environment, **or**
   - Start the Supabase local stack with seeded data and expose the Postgres connection parameters.
2. After credentials/schema are available, run:
   - `supabase start` (if using local stack) and confirm Postgres port.
   - `supabase db dump --schema-only -f tmp/schema.sql` or `pg_dump -s` to capture the live schema.
   - `psql $SUPABASE_DB_URL -c "\d+"` to enumerate tables, columns, defaults, constraints, indexes, enums, views, and materialized views.
3. With the live schema in hand, proceed to:
   - Identify missing defaults, incorrect nullability, type mismatches (e.g., `timestamp` → `timestamptz`), missing PK/FK, index gaps, enum drift, and view/materialized view candidates.
   - Generate a **single SQL migration** that applies only the verified fixes without data loss.

## Deliverables after access is available
- Full audit report enumerating every issue detected in the live schema.
- Consolidated SQL migration implementing the verified fixes.
- Updated ERD (tables, relationships, PK/FK, indexes, enums, views/matviews).
- Execution steps for applying the migration safely.

> Until live schema access (or a fresh dump) is provided, producing the requested automated repair would require guessing, which is explicitly disallowed. Once access is available, the above steps will be executed to deliver the complete audit and migration.
