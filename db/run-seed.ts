// db/run-seed.ts
import { seed } from "./migrations/seed";
import { seedUserPasswords } from "./migrations/seed-user-passwords";

async function main() {
    console.log("Running seed...");
    await seed();
    await seedUserPasswords();
    console.log("Seed completed!");
    process.exit(0);
}

main().catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
});
