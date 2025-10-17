import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | null = null

function getSql() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

    if (!databaseUrl) {
      throw new Error(
        "Database connection string not found. Please set DATABASE_URL environment variable in the Vars section.",
      )
    }

    sql = neon(databaseUrl)
  }
  return sql
}

export interface LeaderboardEntry {
  id: number
  name: string
  ship_type: string
  score: number
  level: number
  created_at: string
}

export async function submitScore(
  name: string,
  shipType: "bullet" | "explosive" | "laser",
  score: number,
  level: number,
): Promise<LeaderboardEntry> {
  const sqlClient = getSql()
  const result = await sqlClient(
    "INSERT INTO leaderboard (name, ship_type, score, level) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, shipType, score, level],
  )
  return result[0] as LeaderboardEntry
}

export async function getTopScores(limit = 10): Promise<LeaderboardEntry[]> {
  const sqlClient = getSql()
  const result = await sqlClient("SELECT * FROM leaderboard ORDER BY score DESC LIMIT $1", [limit])
  return result as LeaderboardEntry[]
}
