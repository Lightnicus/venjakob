// db/migrate.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import config from "../drizzle.config"

const connectionString = "postgres://postgres:postgres@localhost:5432/venjakob"; // make env value
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function main() {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations completed!");
    process.exit(0);
}

main().catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
});
