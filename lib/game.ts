import { Player } from "./entities/player"
import type { Enemy } from "./entities/enemy"
import { Boss } from "./entities/boss"
import { Bullet } from "./entities/bullet"
import { PowerUp } from "./entities/power-up"
import { Particle } from "./entities/particle"
import { StarField } from "./entities/starfield"
import { EnemyFormation } from "./formations"

interface GameCallbacks {
  onScoreUpdate: (score: number) => void
  onLevelUpdate: (level: number) => void
  onLivesUpdate: (lives: number) => void
  onWeaponLevelUpdate: (weaponLevel: number) => void
  onShieldUpdate: (shield: number) => void
  onGameOver: () => void
  onBossDefeated: () => void
}

export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private callbacks: GameCallbacks
  private animationId: number | null = null
  private lastTime = 0
  private running = false

  // Game state
  private score = 0
  private level = 1
  private lives = 3
  private weaponLevel = 1
  private weaponType: "bullet" | "explosive" | "laser" = "bullet"
  private shield = 0
  private isBossLevel = false
  private waveComplete = false
  private levelTransitionTimer = 0

  private explosiveBullets = false
  private explosiveTimer = 0
  private invincibilityTimer = 0
  private speedBoostTimer = 0
  private fireRateBoostTimer = 0
  private scoreMultiplier = 1
  private scoreMultiplierTimer = 0
  private slowMoTimer = 0
  private laserTimer = 0

  private enemySpawnQueue: Enemy[] = []
  private enemySpawnTimer = 0
  private enemySpawnInterval = 200 // ms between spawns

  // Entities
  private player: Player
  private enemies: Enemy[] = []
  private boss: Boss | null = null
  private bullets: Bullet[] = []
  private enemyBullets: Bullet[] = []
  private powerUps: PowerUp[] = []
  private particles: Particle[] = []
  private starField: StarField

  // Input
  private keys: Set<string> = new Set()
  private mouseDown = false
  private shootCooldown = 0
  private isTouchDevice = false
  private touchActive = false
  private touchX = 0
  private touchY = 0

  // Screen shake
  private shakeAmount = 0
  private shakeDecay = 0.9

  private mouseX = 0
  private mouseY = 0

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.canvas = canvas
    this.ctx = ctx
    this.callbacks = callbacks

    this.player = new Player(canvas.width / 2, canvas.height - 80)
    this.starField = new StarField(canvas.width, canvas.height)

    this.isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0

    this.setupInput()
  }

  private setupInput() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key.toLowerCase())
      if (e.key === " ") {
        e.preventDefault()
      }
    })

    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key.toLowerCase())
    })

    this.canvas.addEventListener("mousedown", () => {
      this.mouseDown = true
    })

    this.canvas.addEventListener("mouseup", () => {
      this.mouseDown = false
    })

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = e.clientX - rect.left
      this.mouseY = e.clientY - rect.top
    })

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.touchActive = true
      const rect = this.canvas.getBoundingClientRect()
      const touch = e.touches[0]
      this.touchX = touch.clientX - rect.left
      this.touchY = touch.clientY - rect.top
    })

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault()
      if (this.touchActive) {
        const rect = this.canvas.getBoundingClientRect()
        const touch = e.touches[0]
        this.touchX = touch.clientX - rect.left
        this.touchY = touch.clientY - rect.top
      }
    })

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault()
      this.touchActive = false
    })

    this.canvas.addEventListener("touchcancel", (e) => {
      e.preventDefault()
      this.touchActive = false
    })
  }

  start(shipType: "bullet" | "explosive" | "laser" = "bullet") {
    this.running = true
    this.score = 0
    this.level = 1
    this.lives = 3
    this.weaponLevel = 1
    this.weaponType = shipType
    this.shield = 0
    this.isBossLevel = false
    this.waveComplete = false
    this.explosiveBullets = false
    this.explosiveTimer = 0
    this.invincibilityTimer = 0
    this.speedBoostTimer = 0
    this.fireRateBoostTimer = 0
    this.scoreMultiplier = 1
    this.scoreMultiplierTimer = 0
    this.slowMoTimer = 0
    this.laserTimer = 0
    this.enemySpawnQueue = []
    this.enemySpawnTimer = 0

    this.player = new Player(this.canvas.width / 2, this.canvas.height - 80)
    this.enemies = []
    this.boss = null
    this.bullets = []
    this.enemyBullets = []
    this.powerUps = []
    this.particles = []

    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLevelUpdate(this.level)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onWeaponLevelUpdate(this.weaponLevel)
    this.callbacks.onShieldUpdate(this.shield)

    this.spawnWave()
    this.lastTime = performance.now()
    this.gameLoop(this.lastTime)
  }

  pause() {
    this.running = false
  }

  resume() {
    this.running = true
    this.lastTime = performance.now()
    this.gameLoop(this.lastTime)
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  private spawnWave() {
    this.waveComplete = false
    this.levelTransitionTimer = 0
    this.enemySpawnQueue = []
    this.enemySpawnTimer = 0

    if (this.level % 3 === 0) {
      this.isBossLevel = true
      this.spawnBoss()
    } else {
      this.isBossLevel = false
      this.spawnEnemyFormation()
    }
  }

  private spawnBoss() {
    const bossType = Math.floor((this.level - 1) / 3) % 8
    this.boss = new Boss(this.canvas.width / 2, 100, bossType, this.level)

    // Boss warning effect
    this.shakeAmount = 10
    for (let i = 0; i < 50; i++) {
      this.particles.push(
        new Particle(
          Math.random() * this.canvas.width,
          Math.random() * this.canvas.height,
          Math.random() * 4 - 2,
          Math.random() * 4 - 2,
          "#ff0000",
          30,
        ),
      )
    }
  }

  private spawnEnemyFormation() {
    const formation = new EnemyFormation(this.canvas.width, this.level)
    this.enemies = formation.getEnemies()
  }

  private handleInput(deltaTime: number) {
    const speedMultiplier = this.speedBoostTimer > 0 ? 1.5 : 1
    const speed = 300 * speedMultiplier * (deltaTime / 1000)

    let moved = false

    // Touch controls (mobile)
    if (this.touchActive) {
      const dx = this.touchX - this.player.x
      const dy = this.touchY - this.player.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 5) {
        const moveSpeed = Math.min(speed, distance)
        this.player.x += (dx / distance) * moveSpeed
        this.player.y += (dy / distance) * moveSpeed

        this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x))
        this.player.y = Math.max(20, Math.min(this.canvas.height - 20, this.player.y))
        moved = true
      }
    }
    // Keyboard controls (always available)
    else if (
      this.keys.has("a") ||
      this.keys.has("arrowleft") ||
      this.keys.has("d") ||
      this.keys.has("arrowright") ||
      this.keys.has("w") ||
      this.keys.has("arrowup") ||
      this.keys.has("s") ||
      this.keys.has("arrowdown")
    ) {
      if (this.keys.has("a") || this.keys.has("arrowleft")) {
        this.player.x = Math.max(20, this.player.x - speed)
      }
      if (this.keys.has("d") || this.keys.has("arrowright")) {
        this.player.x = Math.min(this.canvas.width - 20, this.player.x + speed)
      }
      if (this.keys.has("w") || this.keys.has("arrowup")) {
        this.player.y = Math.max(20, this.player.y - speed)
      }
      if (this.keys.has("s") || this.keys.has("arrowdown")) {
        this.player.y = Math.min(this.canvas.height - 20, this.player.y + speed)
      }
      moved = true
    }

    this.shootCooldown -= deltaTime
    const fireRateMultiplier = this.fireRateBoostTimer > 0 ? 0.5 : 1
    const cooldownTime = Math.max(100, 200 - this.weaponLevel * 20) * fireRateMultiplier

    const shouldShoot = this.keys.has(" ") || this.mouseDown || (this.isTouchDevice && this.touchActive)

    if (shouldShoot && this.shootCooldown <= 0) {
      this.shoot()
      this.shootCooldown = cooldownTime
    }
  }

  private shoot() {
    if (this.weaponType === "laser" && this.laserTimer > 0) {
      this.shootLaser()
      return
    }

    const bulletSpeed = -8
    const spreadAngle = Math.PI / 12

    const weaponPatterns = {
      bullet: this.shootBulletWeapon.bind(this),
      explosive: this.shootExplosiveWeapon.bind(this),
      laser: this.shootLaserWeapon.bind(this),
    }

    weaponPatterns[this.weaponType](bulletSpeed, spreadAngle)

    // Muzzle flash particles
    for (let i = 0; i < 3; i++) {
      this.particles.push(
        new Particle(
          this.player.x + (Math.random() - 0.5) * 20,
          this.player.y - 20,
          (Math.random() - 0.5) * 2,
          -Math.random() * 3,
          "#ffffff",
          10,
        ),
      )
    }
  }

  private shootBulletWeapon(bulletSpeed: number, spreadAngle: number) {
    switch (this.weaponLevel) {
      case 1:
        this.bullets.push(new Bullet(this.player.x, this.player.y - 20, 0, bulletSpeed, "#00ffff", 5, false))
        break
      case 2:
        this.bullets.push(new Bullet(this.player.x - 10, this.player.y - 20, 0, bulletSpeed, "#00ffff", 5, false))
        this.bullets.push(new Bullet(this.player.x + 10, this.player.y - 20, 0, bulletSpeed, "#00ffff", 5, false))
        break
      case 3:
        this.bullets.push(new Bullet(this.player.x, this.player.y - 20, 0, bulletSpeed, "#00ffff", 6, false))
        this.bullets.push(
          new Bullet(
            this.player.x - 15,
            this.player.y - 15,
            -Math.sin(spreadAngle) * 8,
            bulletSpeed,
            "#00ffff",
            6,
            false,
          ),
        )
        this.bullets.push(
          new Bullet(
            this.player.x + 15,
            this.player.y - 15,
            Math.sin(spreadAngle) * 8,
            bulletSpeed,
            "#00ffff",
            6,
            false,
          ),
        )
        break
      case 4:
        for (let i = -1; i <= 1; i++) {
          this.bullets.push(
            new Bullet(this.player.x + i * 15, this.player.y - 20, i * 0.5, bulletSpeed, "#00ffff", 7, false),
          )
        }
        this.bullets.push(new Bullet(this.player.x - 20, this.player.y - 10, -2, bulletSpeed, "#00ffff", 7, false))
        this.bullets.push(new Bullet(this.player.x + 20, this.player.y - 10, 2, bulletSpeed, "#00ffff", 7, false))
        break
      case 5:
        for (let i = -2; i <= 2; i++) {
          this.bullets.push(
            new Bullet(this.player.x + i * 12, this.player.y - 20, i * 0.6, bulletSpeed, "#00ffff", 8, false),
          )
        }
        this.bullets.push(new Bullet(this.player.x - 25, this.player.y - 10, -3, bulletSpeed, "#00ffff", 8, false))
        this.bullets.push(new Bullet(this.player.x + 25, this.player.y - 10, 3, bulletSpeed, "#00ffff", 8, false))
        break
    }
  }

  private shootExplosiveWeapon(bulletSpeed: number, spreadAngle: number) {
    const bulletSize = 6 + this.weaponLevel * 1.5
    const bulletColor = ["#ff6600", "#ff5500", "#ff4400", "#ff2200", "#ff0000"][this.weaponLevel - 1]

    this.bullets.push(new Bullet(this.player.x, this.player.y - 20, 0, bulletSpeed, bulletColor, bulletSize, true))
  }

  private shootLaserWeapon(bulletSpeed: number, spreadAngle: number) {
    // Laser weapon shoots a continuous beam, not bullets
    // Activate laser timer for rendering
    this.laserTimer = 100 // Duration of laser beam
  }

  private getRandomPowerUpType(): PowerUp["type"] {
    const types: PowerUp["type"][] = [
      "weapon",
      "weapon",
      "weapon", // Increased weapon drop rate (3x)
      "shield",
      "health",
      "invincibility",
      "speed",
      "firerate",
      "multiplier",
      "slowmo",
    ]
    return types[Math.floor(Math.random() * types.length)]
  }

  private collectPowerUp(type: PowerUp["type"]) {
    switch (type) {
      case "weapon":
        this.weaponLevel = Math.min(5, this.weaponLevel + 1)
        this.callbacks.onWeaponLevelUpdate(this.weaponLevel)
        break
      case "shield":
        this.shield = Math.min(5, this.shield + 1)
        this.callbacks.onShieldUpdate(this.shield)
        break
      case "health":
        this.lives = Math.min(5, this.lives + 1)
        this.callbacks.onLivesUpdate(this.lives)
        break
      case "invincibility":
        this.player.invulnerable = true
        this.invincibilityTimer = 8000
        break
      case "speed":
        this.speedBoostTimer = 10000
        break
      case "firerate":
        this.fireRateBoostTimer = 10000
        break
      case "multiplier":
        this.scoreMultiplier = 2
        this.scoreMultiplierTimer = 15000
        break
      case "slowmo":
        this.slowMoTimer = 8000
        break
    }
  }

  private update(deltaTime: number) {
    if (!this.running) return

    const timeScale = this.slowMoTimer > 0 ? 0.5 : 1
    const scaledDelta = deltaTime * timeScale

    if (this.invincibilityTimer > 0) this.invincibilityTimer -= deltaTime
    if (this.invincibilityTimer <= 0) this.player.invulnerable = false

    if (this.speedBoostTimer > 0) this.speedBoostTimer -= deltaTime
    if (this.fireRateBoostTimer > 0) this.fireRateBoostTimer -= deltaTime
    if (this.slowMoTimer > 0) this.slowMoTimer -= deltaTime
    if (this.laserTimer > 0) this.laserTimer -= deltaTime

    if (this.scoreMultiplierTimer > 0) {
      this.scoreMultiplierTimer -= deltaTime
      if (this.scoreMultiplierTimer <= 0) this.scoreMultiplier = 1
    }

    this.starField.update(scaledDelta)
    this.handleInput(deltaTime)
    this.player.update(scaledDelta, this.shield)

    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(scaledDelta)
      return bullet.y > -10
    })

    this.enemyBullets = this.enemyBullets.filter((bullet) => {
      bullet.update(scaledDelta)
      return bullet.y < this.canvas.height + 10
    })

    if (!this.isBossLevel) {
      this.enemies.forEach((enemy) => {
        enemy.update(scaledDelta)

        if (Math.random() < 0.0003 * this.level) {
          this.enemyBullets.push(new Bullet(enemy.x, enemy.y + 20, 0, 4, "#ffaa00", 8, false))
        }
      })
    }

    if (this.boss) {
      this.boss.update(scaledDelta)

      const newBullets = this.boss.shoot(this.player.x, this.player.y)
      newBullets.forEach((bullet) => {
        bullet.vx *= 0.8
        bullet.vy *= 0.8
      })
      this.enemyBullets.push(...newBullets)

      const healthPercent = this.boss.health / this.boss.maxHealth
      if (healthPercent <= 0.75 && !this.boss.dropped75) {
        this.boss.dropped75 = true
        this.dropBossItem()
      }
      if (healthPercent <= 0.5 && !this.boss.dropped50) {
        this.boss.dropped50 = true
        this.dropBossItem()
      }
      if (healthPercent <= 0.25 && !this.boss.dropped25) {
        this.boss.dropped25 = true
        this.dropBossItem()
      }

      if (this.boss.health <= 0 && !this.waveComplete) {
        this.waveComplete = true
        this.levelTransitionTimer = 3000
        this.score += 5000 * this.scoreMultiplier
        this.callbacks.onScoreUpdate(this.score)

        this.shakeAmount = 20
        for (let i = 0; i < 100; i++) {
          this.particles.push(
            new Particle(
              this.boss.x + (Math.random() - 0.5) * 100,
              this.boss.y + (Math.random() - 0.5) * 100,
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 10,
              ["#ff0000", "#ff8800", "#ffff00", "#ffffff"][Math.floor(Math.random() * 4)],
              60,
            ),
          )
        }

        for (let i = 0; i < 3; i++) {
          this.powerUps.push(
            new PowerUp(this.boss.x + (Math.random() - 0.5) * 80, this.boss.y, this.getRandomPowerUpType()),
          )
        }

        this.boss = null
        this.callbacks.onBossDefeated()
      }
    }

    this.powerUps = this.powerUps.filter((powerUp) => {
      powerUp.update(deltaTime)
      return powerUp.y < this.canvas.height + 20
    })

    this.particles = this.particles.filter((particle) => {
      particle.update(scaledDelta)
      return particle.life > 0
    })

    this.checkCollisions()

    if (!this.isBossLevel && !this.waveComplete && this.enemies.length === 0) {
      this.waveComplete = true
      this.levelTransitionTimer = 2000
    }

    if (this.waveComplete) {
      this.levelTransitionTimer -= deltaTime
      if (this.levelTransitionTimer <= 0) {
        this.level++
        this.callbacks.onLevelUpdate(this.level)
        this.spawnWave()
      }
    }

    if (this.shakeAmount > 0.1) {
      this.shakeAmount *= this.shakeDecay
    } else {
      this.shakeAmount = 0
    }
  }

  private dropBossItem() {
    if (!this.boss) return
    this.powerUps.push(
      new PowerUp(this.boss.x + (Math.random() - 0.5) * 80, this.boss.y + 50, this.getRandomPowerUpType()),
    )
  }

  private checkCollisions() {
    if (this.shield > 0) {
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = this.enemyBullets[i]
        const shieldHit = this.player.checkShieldCollision(bullet.x, bullet.y, 30)
        if (shieldHit) {
          this.enemyBullets.splice(i, 1)
          this.shield--
          this.callbacks.onShieldUpdate(this.shield)
          for (let j = 0; j < 5; j++) {
            this.particles.push(
              new Particle(bullet.x, bullet.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, "#00ffff", 15),
            )
          }
        }
      }
    }

    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = this.bullets[bulletIndex]
      let bulletHit = false

      for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = this.enemies[enemyIndex]

        if (this.checkCollision(bullet, enemy, 15)) {
          bulletHit = true
          enemy.health -= 1

          if (bullet.explosive) {
            for (let nearbyIndex = this.enemies.length - 1; nearbyIndex >= 0; nearbyIndex--) {
              if (nearbyIndex === enemyIndex) continue
              const nearbyEnemy = this.enemies[nearbyIndex]
              if (this.checkCollision(bullet, nearbyEnemy, 50)) {
                nearbyEnemy.health -= 1
                if (nearbyEnemy.health <= 0) {
                  this.enemies.splice(nearbyIndex, 1)
                  this.score += 100 * this.scoreMultiplier
                  this.callbacks.onScoreUpdate(this.score)
                  this.createExplosion(nearbyEnemy.x, nearbyEnemy.y)
                  if (nearbyIndex < enemyIndex) enemyIndex--
                }
              }
            }
            for (let i = 0; i < 20; i++) {
              this.particles.push(
                new Particle(bullet.x, bullet.y, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, "#ff8800", 40),
              )
            }
          }

          if (enemy.health <= 0) {
            this.enemies.splice(enemyIndex, 1)
            this.score += 100 * this.scoreMultiplier
            this.callbacks.onScoreUpdate(this.score)
            this.createExplosion(enemy.x, enemy.y)

            if (Math.random() < 0.15) {
              this.powerUps.push(new PowerUp(enemy.x, enemy.y, this.getRandomPowerUpType()))
            }
          }
          break
        }
      }

      if (bulletHit) {
        this.bullets.splice(bulletIndex, 1)
      }
    }

    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = this.bullets[bulletIndex]

      if (this.boss && this.checkCollision(bullet, this.boss, 40)) {
        this.bullets.splice(bulletIndex, 1)
        this.boss.takeDamage(1)
        this.shakeAmount = 3

        if (bullet.explosive) {
          this.boss.takeDamage(2)
          for (let i = 0; i < 15; i++) {
            this.particles.push(
              new Particle(bullet.x, bullet.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, "#ff8800", 30),
            )
          }
        } else {
          for (let i = 0; i < 5; i++) {
            this.particles.push(
              new Particle(bullet.x, bullet.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, "#ffffff", 20),
            )
          }
        }
      }
    }

    for (let index = this.enemyBullets.length - 1; index >= 0; index--) {
      const bullet = this.enemyBullets[index]

      if (this.checkCollision(bullet, this.player, 12) && !this.player.invulnerable && this.invincibilityTimer <= 0) {
        this.enemyBullets.splice(index, 1)
        this.playerHit()
      }
    }

    for (let index = this.powerUps.length - 1; index >= 0; index--) {
      const powerUp = this.powerUps[index]

      if (this.checkCollision(powerUp, this.player, 20)) {
        this.powerUps.splice(index, 1)
        this.collectPowerUp(powerUp.type)

        for (let i = 0; i < 15; i++) {
          this.particles.push(
            new Particle(powerUp.x, powerUp.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, powerUp.color, 25),
          )
        }
      }
    }
  }

  private createExplosion(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, "#ff8800", 30))
    }
  }

  private checkCollision(obj1: any, obj2: any, distance: number): boolean {
    const dx = obj1.x - obj2.x
    const dy = obj1.y - obj2.y
    return Math.sqrt(dx * dx + dy * dy) < distance
  }

  private playerHit() {
    this.lives--
    this.callbacks.onLivesUpdate(this.lives)
    this.player.invulnerable = true
    this.shakeAmount = 15

    for (let i = 0; i < 20; i++) {
      this.particles.push(
        new Particle(this.player.x, this.player.y, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, "#ff0000", 40),
      )
    }

    if (this.lives <= 0) {
      this.running = false
      this.callbacks.onGameOver()
    }

    setTimeout(() => {
      this.player.invulnerable = false
    }, 2000)
  }

  private shootLaser() {
    const laserWidth = 20
    const laserX = this.player.x
    const laserY = this.player.y - 20

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      if (Math.abs(enemy.x - laserX) < laserWidth && enemy.y < laserY) {
        enemy.health -= 0.5 // Increased damage per frame
        if (enemy.health <= 0) {
          this.enemies.splice(i, 1)
          this.score += 100 * this.scoreMultiplier
          this.callbacks.onScoreUpdate(this.score)
          this.createExplosion(enemy.x, enemy.y)
          if (Math.random() < 0.15) {
            this.powerUps.push(new PowerUp(enemy.x, enemy.y, this.getRandomPowerUpType()))
          }
        }
      }
    }

    // Damage boss if in path
    if (this.boss && Math.abs(this.boss.x - laserX) < laserWidth + 40) {
      this.boss.takeDamage(0.2)
      this.shakeAmount = 1
    }

    // Laser particles
    for (let i = 0; i < 2; i++) {
      this.particles.push(
        new Particle(
          laserX + (Math.random() - 0.5) * laserWidth,
          laserY - Math.random() * 100,
          (Math.random() - 0.5) * 2,
          -Math.random() * 5,
          "#00ff88",
          15,
        ),
      )
    }
  }

  private render() {
    this.ctx.save()
    if (this.shakeAmount > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeAmount
      const shakeY = (Math.random() - 0.5) * this.shakeAmount
      this.ctx.translate(shakeX, shakeY)
    }

    this.ctx.fillStyle = "#000814"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.starField.draw(this.ctx)
    this.particles.forEach((particle) => particle.draw(this.ctx))

    if (this.laserTimer > 0) {
      this.drawLaser()
    }

    this.player.draw(this.ctx, this.shield)
    this.bullets.forEach((bullet) => bullet.draw(this.ctx))
    this.enemyBullets.forEach((bullet) => bullet.draw(this.ctx))
    this.enemies.forEach((enemy) => enemy.draw(this.ctx))

    if (this.boss) {
      this.boss.draw(this.ctx)

      const barWidth = 500
      const barHeight = 24
      const barX = (this.canvas.width - barWidth) / 2
      const barY = this.canvas.height - 60

      // Background
      this.ctx.fillStyle = "#1a1a2e"
      this.ctx.fillRect(barX, barY, barWidth, barHeight)

      // Health bar
      const healthPercent = this.boss.health / this.boss.maxHealth
      const healthColor = healthPercent > 0.5 ? "#00ff00" : healthPercent > 0.25 ? "#ffff00" : "#ff0000"

      this.ctx.fillStyle = healthColor
      this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)

      this.ctx.strokeStyle = "#ffffff"
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.moveTo(barX + barWidth * 0.75, barY)
      this.ctx.lineTo(barX + barWidth * 0.75, barY + barHeight)
      this.ctx.moveTo(barX + barWidth * 0.5, barY)
      this.ctx.lineTo(barX + barWidth * 0.5, barY + barHeight)
      this.ctx.moveTo(barX + barWidth * 0.25, barY)
      this.ctx.lineTo(barX + barWidth * 0.25, barY + barHeight)
      this.ctx.stroke()

      // Border
      this.ctx.strokeStyle = "#00ffff"
      this.ctx.lineWidth = 3
      this.ctx.strokeRect(barX, barY, barWidth, barHeight)

      // Boss name
      this.ctx.fillStyle = "#ffffff"
      this.ctx.font = "bold 14px monospace"
      this.ctx.textAlign = "center"
      this.ctx.shadowBlur = 5
      this.ctx.shadowColor = "#000000"
      this.ctx.fillText(this.boss.name, this.canvas.width / 2, barY - 8)
      this.ctx.shadowBlur = 0

      // Health text
      this.ctx.fillStyle = "#000000"
      this.ctx.font = "bold 12px monospace"
      this.ctx.fillText(
        `${Math.ceil(this.boss.health)} / ${this.boss.maxHealth}`,
        this.canvas.width / 2,
        barY + barHeight / 2 + 4,
      )
    }

    this.powerUps.forEach((powerUp) => powerUp.draw(this.ctx))

    let timerY = this.canvas.height - 25
    const timerX = 10

    if (this.invincibilityTimer > 0) {
      this.renderBuffTimer(timerX, timerY, "⭐ INVINCIBLE", this.invincibilityTimer, "#00ffff")
      timerY -= 28
    }
    if (this.speedBoostTimer > 0) {
      this.renderBuffTimer(timerX, timerY, "⚡ SPEED", this.speedBoostTimer, "#ffff00")
      timerY -= 28
    }
    if (this.fireRateBoostTimer > 0) {
      this.renderBuffTimer(timerX, timerY, "🔥 FIRE RATE", this.fireRateBoostTimer, "#ff4400")
      timerY -= 28
    }
    if (this.scoreMultiplierTimer > 0) {
      this.renderBuffTimer(timerX, timerY, "✨ 2X SCORE", this.scoreMultiplierTimer, "#ffaa00")
      timerY -= 28
    }
    if (this.slowMoTimer > 0) {
      this.renderBuffTimer(timerX, timerY, "⏱️ SLOW-MO", this.slowMoTimer, "#8800ff")
      timerY -= 28
    }
    if (this.laserTimer > 0) {
      this.renderBuffTimer(timerX, timerY, "🔫 LASER", this.laserTimer, "#00ff88")
      timerY -= 28
    }

    if (this.waveComplete && this.levelTransitionTimer > 0) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      this.ctx.fillRect(0, this.canvas.height / 2 - 60, this.canvas.width, 120)

      this.ctx.fillStyle = "#00ff00"
      this.ctx.font = "bold 48px monospace"
      this.ctx.textAlign = "center"
      this.ctx.shadowBlur = 20
      this.ctx.shadowColor = "#00ff00"
      this.ctx.fillText("LEVEL COMPLETE!", this.canvas.width / 2, this.canvas.height / 2)

      this.ctx.fillStyle = "#ffffff"
      this.ctx.font = "bold 24px monospace"
      this.ctx.shadowBlur = 10
      this.ctx.fillText(
        `Next level in ${Math.ceil(this.levelTransitionTimer / 1000)}...`,
        this.canvas.width / 2,
        this.canvas.height / 2 + 40,
      )
      this.ctx.shadowBlur = 0
    }

    this.ctx.restore()
  }

  private drawLaser() {
    const laserWidth = 20
    const laserX = this.player.x
    const laserY = this.player.y - 20

    // Outer glow
    const gradient = this.ctx.createLinearGradient(laserX - laserWidth, 0, laserX + laserWidth, 0)
    gradient.addColorStop(0, "rgba(0, 255, 136, 0)")
    gradient.addColorStop(0.5, "rgba(0, 255, 136, 0.3)")
    gradient.addColorStop(1, "rgba(0, 255, 136, 0)")

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(laserX - laserWidth, 0, laserWidth * 2, laserY)

    // Inner beam
    const innerGradient = this.ctx.createLinearGradient(laserX - laserWidth / 2, 0, laserX + laserWidth / 2, 0)
    innerGradient.addColorStop(0, "rgba(0, 255, 136, 0.3)")
    innerGradient.addColorStop(0.5, "rgba(0, 255, 136, 1)")
    innerGradient.addColorStop(1, "rgba(0, 255, 136, 0.3)")

    this.ctx.fillStyle = innerGradient
    this.ctx.fillRect(laserX - laserWidth / 2, 0, laserWidth, laserY)

    // Core beam
    this.ctx.fillStyle = "#ffffff"
    this.ctx.fillRect(laserX - 3, 0, 6, laserY)

    // Glow effect
    this.ctx.shadowBlur = 20
    this.ctx.shadowColor = "#00ff88"
    this.ctx.strokeStyle = "#00ff88"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(laserX, 0)
    this.ctx.lineTo(laserX, laserY)
    this.ctx.stroke()
    this.ctx.shadowBlur = 0
  }

  private renderBuffTimer(x: number, y: number, label: string, timer: number, color: string) {
    const width = 140
    const height = 20

    this.ctx.fillStyle = `${color}99`
    this.ctx.fillRect(x, y, width, height)
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 1.5
    this.ctx.strokeRect(x, y, width, height)

    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "bold 10px monospace"
    this.ctx.textAlign = "left"
    this.ctx.fillText(`${label}: ${Math.ceil(timer / 1000)}s`, x + 4, y + 14)
  }

  private gameLoop(currentTime: number) {
    if (!this.running) return

    const deltaTime = Math.min(currentTime - this.lastTime, 100)
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
  }

  nextLevel() {
    if (this.waveComplete) {
      this.levelTransitionTimer = 0
    } else {
      this.waveComplete = true
      this.levelTransitionTimer = 0
    }
  }

  restartLevel() {
    this.enemies = []
    this.boss = null
    this.bullets = []
    this.enemyBullets = []
    this.powerUps = []
    this.particles = []
    this.waveComplete = false
    this.enemySpawnQueue = []
    this.enemySpawnTimer = 0
    this.spawnWave()
  }

  skipToBoss() {
    this.level = Math.floor(this.level / 3) * 3 + 3
    this.callbacks.onLevelUpdate(this.level)
    this.restartLevel()
  }
}
