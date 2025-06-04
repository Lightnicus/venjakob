# Database Seeds

This directory contains SQL files that seed the database with initial data.

## How it Works

- All `.sql` files in this directory will be executed in **alphabetical order**
- Use numbered prefixes to control execution order: `01_`, `02_`, etc.
- Files use `ON CONFLICT DO NOTHING` to be idempotent (safe to run multiple times)

## Usage

Run all seed files:
```bash
pnpm run db:seed
```

## File Naming Convention

- `01_languages.sql` - Language data
- `02_categories.sql` - Category data (example)
- `03_users.sql` - Initial user data (example)

## Adding New Seeds

1. Create a new `.sql` file with appropriate numbering
2. Use `ON CONFLICT DO NOTHING` for idempotency
3. Test the file independently if needed:
   ```bash
   psql $DATABASE_URL -f lib/db/seeds/your-file.sql
   ```

## Requirements

- `psql` must be installed and available in PATH
- `DATABASE_URL` environment variable must be set 