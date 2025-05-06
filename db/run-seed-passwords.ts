import { seedUserPasswords } from "./migrations/seed-user-passwords"

async function main() {
  console.log("Seeding user passwords...")
  await seedUserPasswords()
  console.log("Password seeding completed!")
  process.exit(0)
}

main().catch((error) => {
  console.error("Password seeding failed:", error)
  process.exit(1)
}) 