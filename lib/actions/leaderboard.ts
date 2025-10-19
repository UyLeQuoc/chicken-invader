"use server"

import { neon } from "@neondatabase/serverless"

export interface LeaderboardEntry {
  id: number
  name: string
  ship_type: string
  score: number
  level: number
  wave: number
  created_at: string
}

function getSql() {
  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      "Database connection string not found. Please set DATABASE_URL environment variable in the Vars section.",
    )
  }

  return neon(databaseUrl)
}

export async function submitScore(name: string, score: number, level: number, wave = 1): Promise<LeaderboardEntry> {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO leaderboard (name, ship_type, score, level, wave) 
      VALUES (${name}, ${"bullet"}, ${score}, ${level}, ${wave}) 
      RETURNING *
    `
    return (result as LeaderboardEntry[])[0]
  } catch (error) {
    console.error("Failed to submit score:", error)
    throw new Error("Failed to submit score to leaderboard")
  }
}

export async function getTopScores(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM leaderboard 
      ORDER BY score DESC 
      LIMIT ${limit}
    `
    return result as LeaderboardEntry[]
  } catch (error) {
    console.error("Failed to get top scores:", error)
    throw new Error("Failed to fetch leaderboard")
  }
}
