import type { Game } from "../game"
import { Projectile } from "./projectile"
import { Particle } from "./particle"

export class Player {
  game: Game
  x: number
  y: number
  width: number
  height: number
  hitRadius: number
  speed: number
  health: number
  invincible: boolean
  invincibleTime: number
  maxInvincibleTime: number
  shooting: boolean
  fireRate: number
  fireTimer: number
  weaponLevel: number
  animationFrame: number
  animationTimer: number
  flashTimer: number

  constructor(x: number, y: number, game: Game) {
    this.game = game
    this.x = x
    this.y = y
    this.width = 40
    this.height = 40
    this.hitRadius = 4
    this.speed = 400
    this.health = 1
    this.invincible = false
    this.invincibleTime = 0
    this.maxInvincibleTime = 2
    this.shooting = false
    this.fireRate = 0.30
    this.fireTimer = 0
    this.weaponLevel = 1
    this.animationFrame = 0
    this.animationTimer = 0
    this.flashTimer = 0
  }

  update(deltaTime: number, keys: Record<string, boolean>): void {
    let dx = 0
    let dy = 0

    if (keys["arrowleft"] || keys["a"]) dx -= 1
    if (keys["arrowright"] || keys["d"]) dx += 1
    if (keys["arrowup"] || keys["w"]) dy -= 1
    if (keys["arrowdown"] || keys["s"]) dy += 1

    if (dx !== 0 && dy !== 0) {
      dx *= 0.707
      dy *= 0.707
    }

    this.x += dx * this.speed * deltaTime
    this.y += dy * this.speed * deltaTime

    this.x = Math.max(20, Math.min(this.game.width - 20, this.x))
    this.y = Math.max(20, Math.min(this.game.height - 20, this.y))

    // Update fire rate based on weapon level
    this.updateFireRate()

    this.fireTimer -= deltaTime
    if (this.shooting && this.fireTimer <= 0) {
      this.shoot()
      this.fireTimer = this.fireRate
    }

    if (this.invincible) {
      this.invincibleTime -= deltaTime
      if (this.invincibleTime <= 0) {
        this.invincible = false
      }
    }

    this.animationTimer += deltaTime
    if (this.animationTimer > 0.1) {
      this.animationFrame = (this.animationFrame + 1) % 4
      this.animationTimer = 0
    }

    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime
    }

    if (Math.random() < 0.5) {
      this.game.particles.push(
        new Particle(
          this.x,
          this.y + 15,
          (Math.random() - 0.5) * 30,
          Math.random() * 50 + 50,
          Math.random() < 0.5 ? "#ff0" : "#f90",
          0.3,
          3 + Math.random() * 2,
        ),
      )
    }
  }

  updateFireRate(): void {
    // Fire rate improves with weapon level: 0.25s at level 1 -> 0.08s at level 20
    const baseFireRate = 0.30
    const minFireRate = 0.1
    const fireRateReduction = (baseFireRate - minFireRate) / 19 // 19 levels from 1 to 20
    this.fireRate = Math.max(minFireRate, baseFireRate - (this.weaponLevel - 1) * fireRateReduction)
  }

  shoot(): void {
    // Play shoot sound
    this.game.audio.play("shoot", 0.2)

    // Damage scales with level: 10 at level 1 -> 180 at level 20
    const damage = 10 + (this.weaponLevel - 1) * 9

    // Pattern repeats every 5 levels (max 20 levels = 4 cycles)
    const patternLevel = ((this.weaponLevel - 1) % 5) + 1

    // Small spread angle increases slightly with level
    const maxSpreadAngle = 0.08 // ~4.5 degrees max
    const spreadAngle = (this.weaponLevel / 20) * maxSpreadAngle

    if (patternLevel === 5) {
      // Laser - no spread
      this.game.projectiles.push(new Projectile(this.x, this.y - 20, 0, -1000, damage, this.game, "laser"))
    } else {
      const bulletCount = patternLevel
      const speed = 800

      for (let i = 0; i < bulletCount; i++) {
        const offset = (i - (bulletCount - 1) / 2) * 15
        
        // Add slight random spread
        const randomSpread = (Math.random() - 0.5) * spreadAngle
        const vx = Math.sin(randomSpread) * speed
        const vy = -Math.cos(randomSpread) * speed
        
        this.game.projectiles.push(
          new Projectile(
            this.x + offset,
            this.y - 20,
            vx,
            vy,
            damage,
            this.game,
          ),
        )
      }
    }

    for (let i = 0; i < 3; i++) {
      this.game.particles.push(
        new Particle(this.x, this.y - 20, (Math.random() - 0.5) * 50, -Math.random() * 100 - 50, "#0ff", 0.1, 4),
      )
    }
  }

  upgradeWeapon(): void {
    if (this.weaponLevel < 20) {
      this.weaponLevel++
      this.updateFireRate()
      this.game.ui.updateWeaponLevel(this.weaponLevel)
    }
  }

  takeDamage(): void {

    this.invincible = true
    this.invincibleTime = this.maxInvincibleTime
    this.flashTimer = 0.3
    this.weaponLevel = Math.max(1, this.weaponLevel - 1)
    this.updateFireRate()
    this.game.ui.updateWeaponLevel(this.weaponLevel)

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 200 + 100
      this.game.particles.push(
        new Particle(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, "#f00", 0.5, 4),
      )
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5
    }

    if (this.flashTimer > 0) {
      ctx.shadowColor = "#f00"
      ctx.shadowBlur = 20
    }

    // Draw shield animation when invincible
    if (this.invincible) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, 25, 0, Math.PI * 2)
      ctx.strokeStyle = "#ffff00"
      ctx.lineWidth = 3
      ctx.shadowColor = "#ffff00"
      ctx.shadowBlur = 15
      ctx.stroke()

      const time = Date.now() / 1000
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time * 2
        const x = this.x + Math.cos(angle) * 25
        const y = this.y + Math.sin(angle) * 25
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#ffff00"
        ctx.fill()
      }
    }

    ctx.shadowColor = "#0ff"
    ctx.shadowBlur = 15

    ctx.beginPath()
    ctx.moveTo(this.x, this.y - 20)
    ctx.lineTo(this.x - 15, this.y + 15)
    ctx.lineTo(this.x, this.y + 10)
    ctx.lineTo(this.x + 15, this.y + 15)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(this.x, this.y - 20, this.x, this.y + 15)
    gradient.addColorStop(0, "#0ff")
    gradient.addColorStop(1, "#0af")
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(this.x, this.y - 5, 4, 0, Math.PI * 2)
    ctx.fillStyle = "#fff"
    ctx.fill()

    const weaponColors = ["#00f", "#0ff", "#ff0", "#f90", "#f00"]
    ctx.strokeStyle = weaponColors[Math.min(this.weaponLevel - 1, 4)]
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(this.x - 10, this.y + 5)
    ctx.lineTo(this.x - 10, this.y - 10)
    ctx.moveTo(this.x + 10, this.y + 5)
    ctx.lineTo(this.x + 10, this.y - 10)
    ctx.stroke()

    ctx.restore()
  }
}
