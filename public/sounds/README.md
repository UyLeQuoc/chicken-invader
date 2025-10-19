# 🔊 Sound Effects Directory

This directory contains all sound effects and background music for Chicken Invaders.

## 📁 Required Sound Files

### Player Sounds
- `shoot.mp3` - Player bullet shot sound
- `laser.mp3` - Laser weapon sound (level 5, 10, 15, 20)
- `bomb.mp3` - Screen-clearing bomb explosion
- `player-hit.mp3` - Player takes damage

### Enemy Sounds
- `enemy-explosion.mp3` - Enemy chicken destroyed
- `enemy-shoot.mp3` - Enemy fires projectile

### Boss Sounds
- `boss-warning.mp3` - Boss warning siren
- `boss-explosion.mp3` - Boss defeated explosion
- `boss-phase.mp3` - Boss phase change sound

### Powerup Sounds
- `powerup.mp3` - Generic powerup collection
- `weapon-upgrade.mp3` - Weapon level up
- `health.mp3` - Health/life pickup

### UI Sounds
- `menu-select.mp3` - Menu button click
- `game-over.mp3` - Game over sound
- `level-complete.mp3` - Level/wave complete

### Background Music (Optional)
- `bgm-menu.mp3` - Main menu background music
- `bgm-game.mp3` - Gameplay background music
- `bgm-boss.mp3` - Boss battle music

## 🎵 Sound Recommendations

### Free Sound Resources
- [OpenGameArt.org](https://opengameart.org/) - Free game assets
- [Freesound.org](https://freesound.org/) - Free sound effects
- [Zapsplat.com](https://www.zapsplat.com/) - Free sound library
- [Mixkit.co](https://mixkit.co/free-sound-effects/) - Free sound effects

### Recommended Search Terms
- "8-bit shoot"
- "laser sound effect"
- "explosion"
- "powerup collect"
- "game over"
- "space shooter music"
- "boss battle theme"

## 📝 Audio Specifications

**Recommended Format:**
- Format: MP3 (for compatibility)
- Sample Rate: 44.1 kHz
- Bit Rate: 128-192 kbps
- Channels: Stereo or Mono

**File Size:**
- Sound effects: < 100 KB each
- Music: < 3 MB each

## 🔧 Usage

The AudioManager will automatically try to load these sounds. If a sound file is missing, the game will continue to work without sound for that specific action.

### Example: Adding a Sound File

1. Download your sound file
2. Convert to MP3 if needed
3. Rename to match the filename above
4. Place in this directory (`/public/sounds/`)
5. Refresh the game - sound will automatically load!

## ⚙️ Volume Settings

Default volumes (can be adjusted in code):
- Music: 30% (0.3)
- Sound Effects: 50% (0.5)

## 🚫 Note

All sound files in this directory are optional. The game will run silently if sounds are not provided. This allows you to:
- Start without sounds
- Add sounds gradually
- Replace sounds with custom ones
- Run the game in silent mode

---

**Tip:** Keep sound effect files short (< 2 seconds) for better performance!

