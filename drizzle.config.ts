// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
    schema: "./db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || ""
        // ssl: 'allow',
        // port: process.env.PGPORT ? +process.env.PGPORT : 5432,
        // host: process.env.PGHOST || "",
        // user: process.env.PGUSER || "",
        // password: process.env.PGPASSWORD || "",
        // database: process.env.PGDATABASE || "",
    },
} satisfies Config;
