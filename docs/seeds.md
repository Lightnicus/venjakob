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

Run individual TypeScript seeds:
```bash
npx tsx lib/db/seeds/blocks-seed.ts
npx tsx lib/db/seeds/03_test-sales-opportunity.ts
```

## File Naming Convention

- `01_languages.sql` - Language data
- `02_permissions.sql` - Permission data
- `03_test-sales-opportunity.ts` - Test client, contact person, and sales opportunity data
- `blocks-seed.ts` - Block and block content data

## TypeScript Seeds

Some seeds are written in TypeScript for more complex logic and relationships:
- Use the Drizzle ORM for type safety and relationships
- Include proper error handling and logging
- Can be run independently or as part of the application
- Handle dependencies between tables automatically

### Test Sales Opportunity Seed

The `03_test-sales-opportunity.ts` seed creates a complete test scenario:
- **Client**: Test GmbH (foreign ID: TEST, German language)
- **Contact Person**: Ed Briem (Sales Manager)
- **Sales Opportunity**: TEST12345 (IT Entwicklung business area)

This seed is useful for testing the sales opportunity management features.

## Adding New Seeds

### SQL Seeds
1. Create a new `.sql` file with appropriate numbering
2. Use `ON CONFLICT DO NOTHING` for idempotency
3. Test the file independently if needed:
   ```bash
   psql $DATABASE_URL -f lib/db/seeds/your-file.sql
   ```

### TypeScript Seeds
1. Create a new `.ts` file in `lib/db/seeds/`
2. Export an async function that performs the seeding
3. Use Drizzle ORM for database operations
4. Include proper error handling and idempotency checks
5. Test the file independently:
   ```bash
   npx tsx lib/db/seeds/your-file.ts
   ```

## Requirements

- `psql` must be installed and available in PATH
- `DATABASE_URL` environment variable must be set 