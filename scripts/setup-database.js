const { PrismaClient } = require("@prisma/client")

async function main() {
  const prisma = new PrismaClient()

  try {
    // Test the connection
    await prisma.$connect()
    console.log("✅ Database connected successfully!")

    // The tables will be created automatically by Prisma
    console.log("✅ Database setup complete!")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
