import { neon } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in environment variables")
    console.error("Please set DATABASE_URL in your .env file")
    process.exit(1)
  }

  try {
    const sql = neon(databaseUrl)
    
    // Read the migration file
    const migrationPath = path.join(__dirname, "01-create-leaderboard.sql")
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8")
    
    console.log("🔄 Running migration: 01-create-leaderboard.sql")
    console.log("=" .repeat(60))
    
    // Split by semicolon and run each statement
    const statements = migrationSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"))
    
    for (const statement of statements) {
      if (statement) {
        console.log(`\n📝 Executing: ${statement.substring(0, 60)}...`)
        await sql(statement)
        console.log("✅ Success")
      }
    }
    
    console.log("\n" + "=" .repeat(60))
    console.log("✅ Migration completed successfully!")
    console.log("\n📊 New table structure:")
    console.log("  - id: SERIAL PRIMARY KEY")
    console.log("  - name: VARCHAR(50)")
    console.log("  - score: INTEGER")
    console.log("  - level: INTEGER")
    console.log("  - wave: INTEGER (NEW!)")
    console.log("  - created_at: TIMESTAMP")
    console.log("\n🚀 Your game is ready to use the leaderboard!")
    
  } catch (error) {
    console.error("\n❌ Migration failed:")
    console.error(error)
    process.exit(1)
  }
}

runMigration()

