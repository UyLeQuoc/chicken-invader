# 🐔 Chicken Invaders - Space Shooter Game

A modern, fast-paced space shooter game built with Next.js, TypeScript, and HTML5 Canvas. Battle through waves of enemy chickens and face epic boss fights!

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/uyle/v0-space-shooter-game)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/PwvwDZafxKW)

## ✨ Features

- 🎮 **Smooth 60 FPS Gameplay** - Canvas-based rendering with optimized performance
- 🚀 **Progressive Weapon System** - 20 weapon levels with repeating patterns (bullets → laser)
- 💥 **18 Boss Attack Patterns** - Unique bullet hell patterns for epic boss fights
- 🎯 **Power-up System** - 7 different power-ups to collect
- 💣 **Bomb Mechanic** - Screen-clearing special attack
- 🏆 **Global Leaderboard** - Compete with players worldwide
- 🌌 **Dynamic Space Background** - Stars, nebulas, planets, galaxies, and asteroids
- ⚡ **Bullet Spread** - Realistic bullet physics with level-based spread

## 🎯 Game Mechanics

### Weapon System
- **Max Level**: 20
- **Pattern Cycle**: Every 5 levels (1x → 2x → 3x → 4x → Laser)
- **Damage Scaling**: 10 DMG → 180 DMG
- **Fire Rate**: 0.30s → 0.10s (auto-improves with level)

### Power-ups
- ⚡ **Weapon** - Upgrade firepower
- ❤️ **Health** - Extra life (Max 5)
- ⭐ **Invincible** - 8s immunity
- 💨 **Speed** - 10s speed boost
- ✨ **Multiplier** - 2x score for 15s
- ⏱️ **Slow-Mo** - 5s bullet time
- 💣 **Bomb** - Extra bomb (Max 5)

### Boss Battles
- Appear every 2 levels
- Health scales with progression
- 18 unique attack patterns
- 4 phases with increasing difficulty

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Neon Database account (for leaderboard)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/chicken-invader.git
cd chicken-invader
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your database connection string:
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

4. **Set up the database**

Create the leaderboard table by running:
```bash
pnpm db:migrate
# or
npm run db:migrate
```

Or manually run the SQL script in `scripts/01-create-leaderboard.sql`

5. **Run the development server**
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

### Using Neon Database

1. Create a free account at [Neon](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to your `.env` file as `DATABASE_URL`
5. Run the migration script

### Database Schema

```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  wave INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎮 Controls

- **Move**: WASD or Arrow Keys
- **Shoot**: SPACE or Mouse Click (auto-fire)
- **Bomb**: B key (screen clear + damage)
- **Pause**: ESC

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Game Engine**: Custom HTML5 Canvas engine
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel

## 📁 Project Structure

```
chicken-invader/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles & animations
│   └── page.tsx           # Main page
├── components/            # React components
│   └── game-canvas.tsx    # Main game component
├── lib/                   # Game logic
│   ├── game.ts           # Core game engine
│   ├── types.ts          # TypeScript types
│   ├── entities/         # Game entities
│   │   ├── player.ts     # Player ship
│   │   ├── enemy.ts      # Enemy chickens
│   │   ├── boss.ts       # Boss fights
│   │   ├── powerup.ts    # Power-ups
│   │   ├── projectile.ts # Bullets & lasers
│   │   ├── particle.ts   # Particle effects
│   │   ├── background.ts # Space background
│   │   └── ui.ts         # Game UI overlay
│   ├── formations.ts     # Enemy formations
│   └── actions/          # Server actions
│       └── leaderboard.ts # Leaderboard API
├── scripts/              # Database scripts
│   └── 01-create-leaderboard.sql
└── public/               # Static assets
    └── chicken-logo.png
```

## 🎨 Game Features Breakdown

### Enemies
- 3 enemy types with increasing difficulty
- Random movement patterns (straight, sine wave, circular)
- Aimed projectiles with inaccuracy
- 20% chance to drop power-ups

### Boss System
- 4 unique boss types rotating every 2 levels
- Health formula: `500 + (type × 100) + (encounter × 300)`
- Phase system with 4 phases
- Attack patterns: Spiral Storm, Shotgun Blast, Circle Barrage, Machine Gun, Laser Sweep, Burst Fire, Meteor Shower, Spiral Laser, Diamond Pattern, Chaos Storm, and more

### Scoring System
- Enemy kills: 100-300 points
- Boss kills: 5000 points
- Combo multiplier system
- 2x multiplier power-up

## 🔧 Development

### Build for production
```bash
pnpm build
npm run build
```

### Run production build
```bash
pnpm start
npm start
```

### Linting
```bash
pnpm lint
npm run lint
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🚢 Deployment

The game is deployed on Vercel and can be accessed at:
**[https://vercel.com/uyle/v0-space-shooter-game](https://vercel.com/uyle/v0-space-shooter-game)**

To deploy your own instance:

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📜 License

This project is open source and available under the MIT License.

## 🎮 Game Tips

- Focus on weapon upgrades early
- Save bombs for boss phases
- Lives and bombs are capped at 5 - use strategically
- Combine buffs for maximum effect
- Watch boss patterns and find safe spots
- Keep moving to dodge predictive shots

---

Built with ❤️ using Next.js and Canvas API
