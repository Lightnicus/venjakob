const { spawn } = require('child_process');
const { readdir, readFile } = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { sql } = require('drizzle-orm');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runSeeds() {
  const seedsDir = path.join(__dirname, '..', 'lib', 'db', 'seeds');
  const databaseUrl = process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.error('❌ POSTGRES_URL environment variable is required');
    process.exit(1);
  }

  // Ensure SSL is disabled for consistent behavior with drizzle config
  const urlWithSSLDisabled = databaseUrl.includes('?') 
    ? databaseUrl + '&sslmode=disable' 
    : databaseUrl + '?sslmode=disable';

  let pool; // Declare pool here to access in finally block

  try {
    console.log('🌱 Starting database seeding with Drizzle ORM...');

    // Parse the database URL to handle SSL configuration
    const url = new URL(urlWithSSLDisabled);
    const poolConfig = {
      connectionString: urlWithSSLDisabled,
      ssl: false
    };
    
    // If not localhost, configure SSL to reject unauthorized certificates
    if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
      poolConfig.ssl = { rejectUnauthorized: false };
    }
    
    pool = new Pool(poolConfig); // Initialize pg Pool
    const db = drizzle(pool);

    // Read all .sql files from seeds directory
    const files = await readdir(seedsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort(); // Run in alphabetical order

    if (sqlFiles.length === 0) {
      console.log('ℹ️  No seed files found in lib/db/seeds/');
      if (pool) await pool.end();
      return;
    }

    console.log(`📁 Found ${sqlFiles.length} seed file(s):`);
    sqlFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');

    // Run each seed file
    for (const file of sqlFiles) {
      const filePath = path.join(seedsDir, file);
      console.log(`🔄 Running seed: ${file}`);

      try {
        const fileContent = await readFile(filePath, 'utf-8');
        if (fileContent.trim() === '') {
          console.log(`⏭️ Skipped empty seed file: ${file}`);
          continue;
        }
        await db.execute(sql.raw(fileContent));
        console.log(`✅ Completed: ${file}`);
      } catch (err) {
        console.error(`❌ Failed: ${file}`);
        // Show both the main error and any underlying cause
        const errorMessage = err && err.message ? err.message : String(err);
        const causeMessage = err && err.cause ? err.cause.message || String(err.cause) : null;
        
        console.error(`   Error: ${errorMessage.trim()}`);
        if (causeMessage) {
          console.error(`   Cause: ${causeMessage.trim()}`);
        }
        
        throw new Error(`Seed file ${file} failed: ${errorMessage}`);
      }
    }

    console.log('');
    console.log('🎉 All seed files completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error.message || error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('ℹ️  Database connection closed.');
    }
  }
}

runSeeds();
