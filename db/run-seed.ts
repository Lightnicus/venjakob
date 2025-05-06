// db/run-seed.ts
import { seed } from "./seed";

async function main() {
    console.log("Running seed...");
    await seed();
    console.log("Seed completed!");
    process.exit(0);
}

main().catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
});
