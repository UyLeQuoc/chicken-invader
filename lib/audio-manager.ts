export class AudioManager {
  private sounds: Map<string, HTMLAudioElement>
  private musicVolume: number
  private sfxVolume: number
  private muted: boolean

  constructor() {
    this.sounds = new Map()
    this.musicVolume = 0.3
    this.sfxVolume = 0.5
    this.muted = false

    // Load sound effects
    this.loadSounds()
  }

  private loadSounds(): void {
    const soundFiles = {
      // Player sounds
      shoot: "/sounds/shoot.mp3",
      laser: "/sounds/shoot.mp3",
      bomb: "/sounds/shoot.mp3",
      playerHit: "/sounds/player-hit.mp3",

      // Enemy sounds
      enemyExplosion: "/sounds/enemy-explosion.mp3",
      enemyShoot: "/sounds/enemy-shoot.mp3",

      // Boss sounds
      bossWarning: "/sounds/boss-warning.mp3",
      bossExplosion: "/sounds/boss-explosion.mp3",
      bossPhaseChange: "/sounds/boss-phase.mp3",

      // Powerup sounds
      powerupCollect: "/sounds/get-item.mp3",
      weaponUpgrade: "/sounds/get-item.mp3",
      healthPickup: "/sounds/get-item.mp3",

      // UI sounds
      menuSelect: "/sounds/menu-select.mp3",
      gameOver: "/sounds/game-over.mp3",
      levelComplete: "/sounds/level-complete.mp3",

      // Background music (optional)
      bgmMenu: "/sounds/bgm-menu.mp3",
      bgmGame: "/sounds/bgm-game.mp3",
      bgmBoss: "/sounds/bgm-boss.mp3",
    }

    console.log("[Audio] Loading sounds...")
    // Load each sound file
    for (const [key, path] of Object.entries(soundFiles)) {
      try {
        const audio = new Audio(path)
        audio.preload = "auto"
        // Set default error handler to track missing files
        audio.addEventListener("error", () => {
          console.warn(`[Audio] Failed to load: ${key} (${path})`)
        })
        audio.addEventListener("canplaythrough", () => {
          console.log(`[Audio] Loaded successfully: ${key}`)
        })
        this.sounds.set(key, audio)
      } catch (error) {
        console.warn(`[Audio] Error loading sound: ${key}`, error)
      }
    }
    console.log(`[Audio] Initialized ${this.sounds.size} sound slots`)
  }

  play(soundName: string, volume?: number): void {
    if (this.muted) {
      console.log(`[Audio] Muted, skipping: ${soundName}`)
      return
    }

    const sound = this.sounds.get(soundName)
    if (!sound) {
      console.warn(`[Audio] Sound not found: ${soundName}`)
      return
    }

    try {
      // Clone the audio to allow overlapping plays
      const soundClone = sound.cloneNode() as HTMLAudioElement
      soundClone.volume = (volume ?? this.sfxVolume) * (this.muted ? 0 : 1)
      console.log(`[Audio] Playing: ${soundName} at volume ${soundClone.volume}`)
      soundClone.play().catch((err) => {
        console.error(`[Audio] Failed to play ${soundName}:`, err)
      })
    } catch (error) {
      console.error(`[Audio] Error playing ${soundName}:`, error)
    }
  }

  playMusic(musicName: string, loop = true): void {
    if (this.muted) return

    const music = this.sounds.get(musicName)
    if (!music) return

    try {
      music.volume = this.musicVolume
      music.loop = loop
      music.play().catch(() => {
        // Silently fail
      })
    } catch (error) {
      // Silently fail
    }
  }

  stopMusic(musicName: string): void {
    const music = this.sounds.get(musicName)
    if (!music) return

    try {
      music.pause()
      music.currentTime = 0
    } catch (error) {
      // Silently fail
    }
  }

  stopAllMusic(): void {
    const musicKeys = ["bgmMenu", "bgmGame", "bgmBoss"]
    for (const key of musicKeys) {
      this.stopMusic(key)
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    // Update all currently playing music
    const musicKeys = ["bgmMenu", "bgmGame", "bgmBoss"]
    for (const key of musicKeys) {
      const music = this.sounds.get(key)
      if (music) {
        music.volume = this.musicVolume
      }
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (muted) {
      this.stopAllMusic()
    }
  }

  toggleMute(): void {
    this.setMuted(!this.muted)
  }

  getMuted(): boolean {
    return this.muted
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager()
  }
  return audioManagerInstance
}

