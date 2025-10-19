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
  shipSpeedLevel: number
  baseSpeed: number
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
    this.baseSpeed = 400
    this.speed = 400
    this.health = 1
    this.invincible = false
    this.invincibleTime = 0
    this.maxInvincibleTime = 2
    this.shooting = false
    this.fireRate = 0.12
    this.fireTimer = 0
    this.weaponLevel = 1
    this.shipSpeedLevel = 0
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

  shoot(): void {
    const baseDamage = 10
    const damage = baseDamage + Math.floor(this.weaponLevel / 5) * 10 + (this.weaponLevel % 5) * 5

    // Pattern repeats every 5 levels
    const patternLevel = ((this.weaponLevel - 1) % 5) + 1

    if (patternLevel === 5) {
      // Laser
      this.game.projectiles.push(new Projectile(this.x, this.y - 20, 0, -1000, damage, this.game, "laser"))
    } else {
      const bulletCount = patternLevel

      if (bulletCount === 1) {
        this.game.projectiles.push(new Projectile(this.x, this.y - 20, 0, -800, damage, this.game))
      } else {
        for (let i = 0; i < bulletCount; i++) {
          const offset = (i - (bulletCount - 1) / 2) * 15
          this.game.projectiles.push(
            new Projectile(
              this.x + offset,
              this.y - 20,
              0,
              -800,
              damage,
              this.game,
            ),
          )
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      this.game.particles.push(
        new Particle(this.x, this.y - 20, (Math.random() - 0.5) * 50, -Math.random() * 100 - 50, "#0ff", 0.1, 4),
      )
    }
  }

  upgradeWeapon(): void {
    this.weaponLevel++
    this.game.ui.updateWeaponLevel(this.weaponLevel)
  }

  upgradeFireRate(): void {
    this.fireRate = Math.max(0.05, this.fireRate - 0.02)
  }

  upgradeShipSpeed(): void {
    if (this.shipSpeedLevel < 5) {
      this.shipSpeedLevel++
      this.baseSpeed = 400 + this.shipSpeedLevel * 60
      this.speed = this.baseSpeed
    }
  }

  takeDamage(): void {

    this.invincible = true
    this.invincibleTime = this.maxInvincibleTime
    this.flashTimer = 0.3
    this.weaponLevel = Math.max(1, this.weaponLevel - 1)
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
