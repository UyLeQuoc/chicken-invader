# Database Scripts

This folder contains SQL scripts for setting up and migrating the database.

## Setup Instructions

1. **Create Database Connection**
   - Get your database connection string from [Neon](https://neon.tech) or your PostgreSQL provider
   - Add it to your `.env` file:
     ```
     DATABASE_URL=postgresql://user:password@host/database
     ```

2. **Run Database Setup**
   
   **Option A: Using Node.js (Recommended - Already installed!)**
   ```bash
   # Run the migration script
   npm run migrate
   ```
   
   **Option B: Using Neon SQL Editor (Easiest)**
   1. Go to your Neon project dashboard
   2. Navigate to **SQL Editor**
   3. Copy the entire contents of `scripts/setup-database.sql`
   4. Paste into the editor
   5. Click **Run**
   
   **Option C: Using psql**
   ```bash
   psql $DATABASE_URL -f scripts/setup-database.sql
   ```

## Scripts

- **`setup-database.sql`** - Complete database setup (creates table and applies all migrations)
- `01-create-leaderboard.sql` - (Legacy) Initial table creation
- `02-update-leaderboard-add-wave.sql` - (Legacy) Migration to add wave column

**Use `setup-database.sql` for all new setups - it handles everything automatically!**

## Alternative: Using Neon SQL Editor

You can also copy and paste the SQL commands directly into the Neon SQL Editor:

1. Go to your Neon project
2. Navigate to SQL Editor
3. Copy and paste the contents of each SQL file
4. Run them in order

## Table Structure (After Migrations)

```sql
leaderboard (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  wave INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Indexes

- `idx_leaderboard_score` - For faster sorting by score (DESC)
- `idx_leaderboard_wave` - For filtering by wave

