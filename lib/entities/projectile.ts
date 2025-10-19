import type { ProjectileType } from "../types"
import type { Game } from "../game"
import { Particle } from "./particle"

export class Projectile {
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  game: Game
  type: ProjectileType
  dead: boolean
  radius: number
  color: string
  trail: boolean
  homing: boolean
  homingStrength: number
  width?: number
  height?: number
  rotation?: number
  rotationSpeed?: number
  animationFrame: number
  animationTimer: number

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    game: Game,
    type: ProjectileType = "bullet",
  ) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.damage = damage
    this.game = game
    this.type = type
    this.dead = false
    this.homing = false
    this.homingStrength = 200
    this.animationFrame = 0
    this.animationTimer = 0

    switch (type) {
      case "bullet":
        this.radius = 4
        this.color = "#0ff"
        this.trail = true
        break
      case "laser":
        this.radius = 6
        this.width = 8
        this.height = 30
        this.color = "#f0f"
        this.trail = true
        break
      case "egg":
        this.radius = 8
        this.width = 12
        this.height = 16
        this.color = "#fff"
        this.rotation = 0
        this.rotationSpeed = 5
        this.trail = false
        break
    }
  }

  update(deltaTime: number): void {
    if (this.homing && this.type === "egg") {
      const dx = this.game.player.x - this.x
      const dy = this.game.player.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 0) {
        this.vx += (dx / dist) * this.homingStrength * deltaTime
        this.vy += (dy / dist) * this.homingStrength * deltaTime

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed > 300) {
          this.vx = (this.vx / speed) * 300
          this.vy = (this.vy / speed) * 300
        }
      }
    }

    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    if (this.type === "egg" && this.rotation !== undefined && this.rotationSpeed !== undefined) {
      this.rotation += this.rotationSpeed * deltaTime
    }

    if (this.trail && Math.random() < 0.5) {
      this.game.particles.push(
        new Particle(this.x, this.y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, this.color, 0.2, 3),
      )
    }

    this.animationTimer += deltaTime
    if (this.animationTimer > 0.05) {
      this.animationFrame = (this.animationFrame + 1) % 4
      this.animationTimer = 0
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    ctx.shadowColor = this.color
    ctx.shadowBlur = 10

    switch (this.type) {
      case "bullet":
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        const bulletGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius)
        bulletGradient.addColorStop(0, "#fff")
        bulletGradient.addColorStop(1, this.color)
        ctx.fillStyle = bulletGradient
        ctx.fill()
        break

      case "laser":
        ctx.translate(this.x, this.y)
        const laserGradient = ctx.createLinearGradient(-(this.width || 0) / 2, 0, (this.width || 0) / 2, 0)
        laserGradient.addColorStop(0, "rgba(255, 0, 255, 0)")
        laserGradient.addColorStop(0.5, "#f0f")
        laserGradient.addColorStop(1, "rgba(255, 0, 255, 0)")
        ctx.fillStyle = laserGradient
        ctx.fillRect(-(this.width || 0) / 2, -(this.height || 0) / 2, this.width || 0, this.height || 0)

        ctx.fillStyle = "#fff"
        ctx.fillRect(-2, -(this.height || 0) / 2, 4, this.height || 0)
        break

      case "egg":
        ctx.translate(this.x, this.y)
        if (this.rotation !== undefined) {
          ctx.rotate(this.rotation)
        }

        if (this.homing) {
          ctx.shadowColor = "#f00"
          ctx.shadowBlur = 20
        }

        ctx.beginPath()
        ctx.ellipse(0, 0, (this.width || 0) / 2, (this.height || 0) / 2, 0, 0, Math.PI * 2)
        const eggGradient = ctx.createRadialGradient(-3, -3, 0, 0, 0, (this.height || 0) / 2)
        eggGradient.addColorStop(0, this.homing ? "#fff" : "#fff")
        eggGradient.addColorStop(1, this.homing ? "#f00" : "#eee")
        ctx.fillStyle = eggGradient
        ctx.fill()

        ctx.fillStyle = this.homing ? "#f00" : "#ddd"
        ctx.beginPath()
        ctx.arc(-3, -2, 2, 0, Math.PI * 2)
        ctx.arc(3, 1, 1.5, 0, Math.PI * 2)
        ctx.arc(-1, 3, 1, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = this.homing ? "#f00" : "#ccc"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(0, 0, (this.width || 0) / 2, (this.height || 0) / 2, 0, 0, Math.PI * 2)
        ctx.stroke()
        break
    }

    ctx.restore()
  }
}

