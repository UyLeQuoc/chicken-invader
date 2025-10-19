import { Player } from "./entities/player"
import { Enemy } from "./entities/enemy"
import { Boss } from "./entities/boss"
import { Powerup } from "./entities/powerup"
import { Particle } from "./entities/particle"
import { Background } from "./entities/background"
import { UI } from "./entities/ui"
import type { Projectile } from "./entities/projectile"
import { checkCircleCollision } from "./collision"

export class Game {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number

  running: boolean
  player: Player
  enemies: Enemy[]
  bosses: Boss[]
  projectiles: Projectile[]
  enemyProjectiles: Projectile[]
  powerups: Powerup[]
  particles: Particle[]

  background: Background
  ui: UI

  score: number
  level: number
  lives: number
  combo: number
  comboTimer: number

  waveActive: boolean
  bossActive: boolean
  waveTimer: number
  waveDelay: number
  enemiesSpawned: number
  maxEnemiesPerWave: number

  screenShake: number
  flashAlpha: number
  flashColor: string

  mouseX: number
  mouseY: number

  activeEffects: Map<string, number>
  scoreMultiplier: number
  timeSlowFactor: number

  private animationId: number | null = null
  private lastTime = 0
  private keys: Record<string, boolean> = {}

  // Callbacks for React integration
  private callbacks: {
  onScoreUpdate: (score: number) => void
  onLevelUpdate: (level: number) => void
  onLivesUpdate: (lives: number) => void
  onWeaponLevelUpdate: (weaponLevel: number) => void
  onGameOver: () => void
    onBossHealthUpdate?: (health: number, maxHealth: number) => void
    onActiveEffectsUpdate?: (effects: Map<string, number>) => void
  }

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    callbacks: {
      onScoreUpdate: (score: number) => void
      onLevelUpdate: (level: number) => void
      onLivesUpdate: (lives: number) => void
      onWeaponLevelUpdate: (weaponLevel: number) => void
      onGameOver: () => void
      onBossHealthUpdate?: (health: number, maxHealth: number) => void
      onActiveEffectsUpdate?: (effects: Map<string, number>) => void
    },
  ) {
    this.canvas = canvas
    this.ctx = ctx
    this.width = canvas.width
    this.height = canvas.height
    this.callbacks = callbacks

    this.running = false
    this.player = new Player(this.width / 2, this.height - 80, this)
    this.enemies = []
    this.bosses = []
    this.projectiles = []
    this.enemyProjectiles = []
    this.powerups = []
    this.particles = []

    this.background = new Background(this.width, this.height)
    this.ui = new UI(this)

    this.score = 0
    this.level = 1
    this.lives = 3
    this.combo = 0
    this.comboTimer = 0

    this.waveActive = false
    this.bossActive = false
    this.waveTimer = 0
    this.waveDelay = 3
    this.enemiesSpawned = 0
    this.maxEnemiesPerWave = 10

    this.screenShake = 0
    this.flashAlpha = 0
    this.flashColor = "white"

    this.mouseX = 0
    this.mouseY = 0

    this.activeEffects = new Map()
    this.scoreMultiplier = 1
    this.timeSlowFactor = 1

    this.setupInput()
  }

  private setupInput(): void {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true
      if (e.key === " ") {
        e.preventDefault()
        this.player.shooting = true
      }
    })

    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false
      if (e.key === " ") {
        this.player.shooting = false
      }
    })

    this.canvas.addEventListener("mousedown", () => {
      this.player.shooting = true
    })

    this.canvas.addEventListener("mouseup", () => {
      this.player.shooting = false
    })

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
    })
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  pause(): void {
    this.running = false
  }

  resume(): void {
    this.running = true
    this.lastTime = performance.now()
    this.gameLoop(this.lastTime)
  }

  start(shipType: "bullet" | "explosive" | "laser" = "bullet"): void {
    this.running = true
    this.score = 0
    this.level = 1
    this.lives = 3
    this.combo = 0
    this.comboTimer = 0

    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLevelUpdate(this.level)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onWeaponLevelUpdate(1)

    this.lastTime = performance.now()
    this.startWave()
    this.gameLoop(this.lastTime)
  }

  restart(): void {
    this.player = new Player(this.width / 2, this.height - 80, this)
    this.enemies = []
    this.bosses = []
    this.projectiles = []
    this.enemyProjectiles = []
    this.powerups = []
    this.particles = []

    this.score = 0
    this.level = 1
    this.lives = 3
    this.combo = 0
    this.comboTimer = 0

    this.waveActive = false
    this.bossActive = false
    this.waveTimer = 0
    this.enemiesSpawned = 0

    this.ui.updateScore(this.score)
    this.ui.updateLevel(this.level)
    this.ui.updateLives(this.lives)

    this.running = true
    this.startWave()
  }

  private startWave(): void {
    const isBossLevel = this.level % 2 === 0

    if (isBossLevel) {
      this.ui.showBossWarning()
      setTimeout(() => {
      this.spawnBoss()
      }, 3000)
    } else {
      this.ui.showLevelTransition(`LEVEL ${this.level} - WAVE`)
      setTimeout(() => {
        this.waveActive = true
        this.enemiesSpawned = 0
        this.maxEnemiesPerWave = 10 + Math.floor(this.level / 2) * 5
      }, 2000)
    }
  }

  private spawnBoss(): void {
    const bossType = Math.floor((this.level - 2) / 2) % 4
    const boss = new Boss(this.width / 2, -100, bossType, this)
    this.bosses.push(boss)
    this.bossActive = true
    this.ui.showBossHealth(boss)
  }

  private spawnEnemy(): void {
    const type = Math.floor(Math.random() * 3) as 0 | 1 | 2
    const formation = Math.floor(Math.random() * 5)

    let x: number, y: number

    switch (formation) {
      case 0:
        x = Math.random() * (this.width - 60) + 30
        y = -30
        break
      case 1:
        x = Math.random() < 0.5 ? -30 : this.width + 30
        y = Math.random() * 200 + 50
        break
      default:
        x = Math.random() * (this.width - 60) + 30
        y = -30
    }

    const enemy = new Enemy(x, y, type, this)
    this.enemies.push(enemy)
  }

  private gameLoop(currentTime: number): void {
    if (!this.running) return

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1)
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
  }

  private update(deltaTime: number): void {
    if (!this.running) return

    // Apply time slow factor to deltaTime
    const adjustedDeltaTime = deltaTime * this.timeSlowFactor

    this.player.update(adjustedDeltaTime, this.keys)
    this.background.update(adjustedDeltaTime)

    if (this.waveActive && !this.bossActive) {
      this.waveTimer += adjustedDeltaTime
      if (this.waveTimer > 0.5 && this.enemiesSpawned < this.maxEnemiesPerWave) {
        this.spawnEnemy()
        this.enemiesSpawned++
        this.waveTimer = 0
      }

      if (this.enemiesSpawned >= this.maxEnemiesPerWave && this.enemies.length === 0) {
        this.waveActive = false
        this.level++
        this.ui.updateLevel(this.level)
        this.callbacks.onLevelUpdate(this.level)
        setTimeout(() => this.startWave(), 2000)
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update(adjustedDeltaTime)

      if (this.enemies[i].y > this.height + 100 || this.enemies[i].x < -100 || this.enemies[i].x > this.width + 100) {
        this.enemies.splice(i, 1)
      }
    }

    for (let i = this.bosses.length - 1; i >= 0; i--) {
      this.bosses[i].update(adjustedDeltaTime)

      if (this.bosses[i].health <= 0) {
        this.defeatBoss(this.bosses[i])
        this.bosses.splice(i, 1)
      }
    }

    // Update boss health UI
    if (this.bosses.length > 0 && this.callbacks.onBossHealthUpdate) {
      const boss = this.bosses[0]
      this.callbacks.onBossHealthUpdate(boss.health, boss.maxHealth)
    } else if (this.bosses.length === 0 && this.callbacks.onBossHealthUpdate) {
      this.callbacks.onBossHealthUpdate(0, 0)
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.projectiles[i].update(adjustedDeltaTime)

      if (this.projectiles[i].y < -10 || this.projectiles[i].dead) {
        this.projectiles.splice(i, 1)
      }
    }

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      this.enemyProjectiles[i].update(adjustedDeltaTime)

      if (this.enemyProjectiles[i].y > this.height + 10 || this.enemyProjectiles[i].dead) {
        this.enemyProjectiles.splice(i, 1)
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      this.powerups[i].update(adjustedDeltaTime)

      if (this.powerups[i].y > this.height + 50) {
        this.powerups.splice(i, 1)
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(adjustedDeltaTime)

      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1)
      }
    }

    this.checkCollisions()

    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime
      if (this.comboTimer <= 0) {
        this.combo = 0
      }
    }

    if (this.screenShake > 0) {
      this.screenShake -= deltaTime * 5
      if (this.screenShake < 0) this.screenShake = 0
    }

    if (this.flashAlpha > 0) {
      this.flashAlpha -= deltaTime * 3
      if (this.flashAlpha < 0) this.flashAlpha = 0
    }

    for (const [effect, duration] of this.activeEffects.entries()) {
      const newDuration = duration - deltaTime
      if (newDuration <= 0) {
        this.activeEffects.delete(effect)
        // Reset effects when they expire
        if (effect === "speed") {
          this.player.speed = 300
        }
        if (effect === "multiplier") {
          this.scoreMultiplier = 1
        }
        if (effect === "slowmo") {
          this.timeSlowFactor = 1
        }
      } else {
        this.activeEffects.set(effect, newDuration)
      }
    }

    // Update active effects UI with countdown timers
    if (this.callbacks.onActiveEffectsUpdate) {
      this.callbacks.onActiveEffectsUpdate(this.activeEffects)
    }
  }

  private checkCollisions(): void {
    for (const p of this.projectiles) {
      if (p.dead) continue

      for (const e of this.enemies) {
        if (checkCircleCollision(p, e, p.radius, e.radius)) {
          p.dead = true
          e.takeDamage(p.damage)
          this.createImpact(e.x, e.y)

          if (e.health <= 0) {
            this.destroyEnemy(e)
          }
          break
        }
      }

      for (const b of this.bosses) {
        if (checkCircleCollision(p, b, p.radius, b.radius)) {
          p.dead = true
          const isCritical = b.isWeakPointHit(p.x, p.y)
          b.takeDamage(p.damage, isCritical)
          this.createImpact(p.x, p.y)
          this.addScreenShake(isCritical ? 0.3 : 0.1)
          this.flash(isCritical ? "red" : "white", isCritical ? 0.3 : 0.1)
          break
        }
      }
    }

    if (!this.player.invincible) {
      for (const ep of this.enemyProjectiles) {
        if (ep.dead) continue

        if (checkCircleCollision(this.player, ep, this.player.hitRadius, ep.radius)) {
          ep.dead = true
          this.playerHit()
          break
        }
      }

      for (const e of this.enemies) {
        if (checkCircleCollision(this.player, e, this.player.hitRadius, e.radius)) {
          this.destroyEnemy(e)
          this.playerHit()
          break
        }
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i]

      const dx = this.player.x - pu.x
      const dy = this.player.y - pu.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 100) {
        pu.vx = (dx / dist) * 100
        pu.vy = (dy / dist) * 100
      }

      if (checkCircleCollision(this.player, pu, 20, pu.radius)) {
        this.collectPowerup(pu)
        this.powerups.splice(i, 1)
      }
    }
  }

  private destroyEnemy(enemy: Enemy): void {
    this.score += enemy.points * (this.combo + 1) * this.scoreMultiplier
    this.ui.updateScore(this.score)
    this.callbacks.onScoreUpdate(this.score)

    this.combo++
    this.comboTimer = 2

    if (this.combo > 1) {
      this.ui.showCombo(this.combo, enemy.x, enemy.y)
    }

    this.createExplosion(enemy.x, enemy.y, enemy.type)

    if (Math.random() < 0.15) {
      const types: Array<
        | "weapon"
        | "firerate"
        | "health"
        | "invincible"
        | "speed"
        | "multiplier"
        | "slowmo"
      > = ["weapon", "firerate", "health", "invincible", "speed", "multiplier", "slowmo"]
      const type = types[Math.floor(Math.random() * types.length)]
      this.powerups.push(new Powerup(enemy.x, enemy.y, type))
    }

    const index = this.enemies.indexOf(enemy)
    if (index > -1) this.enemies.splice(index, 1)
  }

  private defeatBoss(boss: Boss): void {
    this.score += 5000
    this.ui.updateScore(this.score)
    this.callbacks.onScoreUpdate(this.score)

    this.createBossExplosion(boss)

    for (let i = 0; i < 3; i++) {
      const types: Array<
        | "weapon"
        | "firerate"
        | "health"
        | "invincible"
        | "speed"
        | "multiplier"
        | "slowmo"
      > = ["weapon", "firerate", "health", "invincible", "speed", "multiplier", "slowmo"]
      const type = types[Math.floor(Math.random() * types.length)]
      const offsetX = (Math.random() - 0.5) * 60
      const offsetY = (Math.random() - 0.5) * 60
      this.powerups.push(new Powerup(boss.x + offsetX, boss.y + offsetY, type))
    }

    this.bossActive = false
    this.ui.hideBossHealth()
    this.ui.showLevelTransition("BOSS DEFEATED!", true)

    this.addScreenShake(1)
    this.flash("white", 0.8)

    setTimeout(() => {
      this.level++
      this.ui.updateLevel(this.level)
      this.callbacks.onLevelUpdate(this.level)
      setTimeout(() => this.startWave(), 2000)
    }, 3000)
  }

  private playerHit(): void {
    this.player.takeDamage()
    this.lives--
    this.ui.updateLives(this.lives)
    this.callbacks.onLivesUpdate(this.lives)
    this.addScreenShake(0.5)
    this.flash("red", 0.5)
    this.combo = 0

    if (this.lives <= 0) {
      this.gameOver()
    } else {
      this.callbacks.onWeaponLevelUpdate(this.player.weaponLevel)
    }
  }

  private collectPowerup(powerup: Powerup): void {
    switch (powerup.type) {
      case "weapon":
        this.player.upgradeWeapon()
        break
      case "firerate":
        this.player.upgradeFireRate()
        break
      case "health":
        this.lives++
        this.callbacks.onLivesUpdate(this.lives)
        this.ui.updateLives(this.lives)
        this.activeEffects.set("health", 0.5)
        break
      case "invincible":
        this.player.invincible = true
        this.player.invincibleTime = 8
        this.activeEffects.set("invincible", 8)
        break
      case "speed":
        this.player.speed = 450
        this.activeEffects.set("speed", 10)
        break
      case "multiplier":
        this.scoreMultiplier = 2
        this.activeEffects.set("multiplier", 15)
        break
      case "slowmo":
        this.timeSlowFactor = 0.5
        this.activeEffects.set("slowmo", 8)
        break
    }

    this.callbacks.onWeaponLevelUpdate(this.player.weaponLevel)

    this.createPowerupEffect(powerup.x, powerup.y, powerup.color)
          this.score += 100 * this.scoreMultiplier
    this.ui.updateScore(this.score)
          this.callbacks.onScoreUpdate(this.score)
  }


  private createExplosion(x: number, y: number, size = 1): void {
    const particleCount = 20 + size * 10
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 200 + 100
      const colors = ["#ff0", "#f90", "#f00", "#fff"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      this.particles.push(
        new Particle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          0.5 + Math.random() * 0.5,
          4 + Math.random() * 4,
        ),
      )
    }

    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 150 + 50
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, "#fff", 1, 6, "feather"))
    }
  }

  private createBossExplosion(boss: Boss): void {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * boss.width
        const offsetY = (Math.random() - 0.5) * boss.height
        this.createExplosion(boss.x + offsetX, boss.y + offsetY, 3)
        this.addScreenShake(0.3)
      }, i * 200)
    }
  }

  private createImpact(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 100 + 50
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, "#fff", 0.2, 3))
    }
  }

  private createPowerupEffect(x: number, y: number, color: string): void {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2
      const speed = 200
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 0.5, 4))
    }
  }

  addScreenShake(intensity: number): void {
    this.screenShake = Math.max(this.screenShake, intensity)
  }

  flash(color: string, alpha: number): void {
    this.flashColor = color
    this.flashAlpha = alpha
  }

  private gameOver(): void {
    this.running = false
    this.ui.showGameOver(this.score)
    this.callbacks.onGameOver()
  }

  render(): void {
    let shakeX = 0,
      shakeY = 0
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake * 20
      shakeY = (Math.random() - 0.5) * this.screenShake * 20
    }

    this.ctx.save()
    this.ctx.translate(shakeX, shakeY)

    this.ctx.clearRect(0, 0, this.width, this.height)

    this.background.render(this.ctx)

    for (const p of this.particles) {
      if (p.layer === 0) p.render(this.ctx)
    }

    for (const pu of this.powerups) {
      pu.render(this.ctx)
    }

    for (const ep of this.enemyProjectiles) {
      ep.render(this.ctx)
    }

    for (const e of this.enemies) {
      e.render(this.ctx)
    }

    for (const b of this.bosses) {
      b.render(this.ctx)
    }

    this.player.render(this.ctx)

    for (const p of this.projectiles) {
      p.render(this.ctx)
    }

    for (const p of this.particles) {
      if (p.layer === 1) p.render(this.ctx)
    }

    this.ctx.restore()

    if (this.flashAlpha > 0) {
      this.ctx.fillStyle = this.flashColor
      this.ctx.globalAlpha = this.flashAlpha
      this.ctx.fillRect(0, 0, this.width, this.height)
      this.ctx.globalAlpha = 1
    }
  }
}
