import type { Game } from "../game"
import { Projectile } from "./projectile"

export class Enemy {
  game: Game
  x: number
  y: number
  type: 0 | 1 | 2
  width: number
  height: number
  radius: number
  health: number
  maxHealth: number
  points: number
  color: string
  speed: number
  vx: number
  vy: number
  pattern: number
  patternTimer: number
  patternPhase: number
  animationFrame: number
  animationTimer: number
  wingAngle: number
  bobOffset: number
  shootTimer: number
  shootInterval: number
  flashTimer: number

  constructor(x: number, y: number, type: 0 | 1 | 2, game: Game) {
    this.game = game
    this.x = x
    this.y = y
    this.type = type

    switch (type) {
      case 0:
        this.width = 30
        this.height = 30
        this.radius = 15
        this.health = 10
        this.maxHealth = 10
        this.points = 100
        this.color = "#f90"
        break
      case 1:
        this.width = 40
        this.height = 40
        this.radius = 20
        this.health = 20
        this.maxHealth = 20
        this.points = 200
        this.color = "#f60"
        break
      case 2:
        this.width = 50
        this.height = 50
        this.radius = 25
        this.health = 30
        this.maxHealth = 30
        this.points = 300
        this.color = "#f30"
        break
    }

    this.speed = 80 + Math.random() * 40
    this.vx = 0
    this.vy = this.speed
    this.pattern = Math.floor(Math.random() * 3)
    this.patternTimer = 0
    this.patternPhase = Math.random() * Math.PI * 2
    this.animationFrame = 0
    this.animationTimer = 0
    this.wingAngle = 0
    this.bobOffset = 0
    this.shootTimer = Math.random() * 3 + 2
    this.shootInterval = 2 + Math.random() * 2
    this.flashTimer = 0
  }

  update(deltaTime: number): void {
    this.patternTimer += deltaTime

    switch (this.pattern) {
      case 0:
        this.vy = this.speed
        this.vx = 0
        break
      case 1:
        this.vy = this.speed * 0.7
        this.vx = Math.sin(this.patternTimer * 2 + this.patternPhase) * 100
        break
      case 2:
        const angle = this.patternTimer * 2
        const radius = 50
        this.vx = Math.cos(angle) * radius
        this.vy = this.speed * 0.6
        break
    }

    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    this.shootTimer -= deltaTime
    if (this.shootTimer <= 0 && this.y > 50 && this.y < this.game.height * 0.6) {
      this.shoot()
      this.shootTimer = this.shootInterval
    }

    this.animationTimer += deltaTime
    if (this.animationTimer > 0.1) {
      this.animationFrame = (this.animationFrame + 1) % 4
      this.animationTimer = 0
    }

    this.wingAngle += deltaTime * 10
    this.bobOffset = Math.sin(Date.now() / 200) * 3

    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime
    }
  }

  shoot(): void {
    const dx = this.game.player.x - this.x
    const dy = this.game.player.y - this.y
    const angle = Math.atan2(dy, dx)
    const inaccuracy = (Math.random() - 0.5) * 0.5

    const speed = 200
    const vx = Math.cos(angle + inaccuracy) * speed
    const vy = Math.sin(angle + inaccuracy) * speed

    this.game.enemyProjectiles.push(new Projectile(this.x, this.y + this.radius, vx, vy, 10, this.game, "egg"))
  }

  takeDamage(damage: number): void {
    this.health -= damage
    this.flashTimer = 0.1
    this.game.ui.showDamage(damage, this.x, this.y, false)
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    ctx.translate(this.x, this.y + this.bobOffset)

    if (this.flashTimer > 0) {
      ctx.shadowColor = "#fff"
      ctx.shadowBlur = 20
    } else {
      ctx.shadowColor = this.color
      ctx.shadowBlur = 10
    }

    const wingFlap = Math.sin(this.wingAngle) * 0.3

    ctx.beginPath()
    ctx.ellipse(-this.width / 4, 0, this.width / 3, this.height / 2, -wingFlap, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(this.width / 4, 0, this.width / 3, this.height / 2, wingFlap, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(0, 0, this.width / 2.5, this.height / 2, 0, 0, Math.PI * 2)

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius)
    gradient.addColorStop(0, this.color)
    gradient.addColorStop(1, this.shadeColor(this.color, -40))
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0, -this.height / 3, this.width / 4, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.stroke()

    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(-5, -this.height / 3, 3, 0, Math.PI * 2)
    ctx.arc(5, -this.height / 3, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#000"
    ctx.beginPath()
    ctx.arc(-5, -this.height / 3, 1.5, 0, Math.PI * 2)
    ctx.arc(5, -this.height / 3, 1.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#ff0"
    ctx.beginPath()
    ctx.moveTo(0, -this.height / 4)
    ctx.lineTo(-3, -this.height / 5)
    ctx.lineTo(3, -this.height / 5)
    ctx.closePath()
    ctx.fill()

    const blink = Math.floor(Date.now() / 500) % 2
    if (blink) {
      ctx.fillStyle = "#0f0"
      ctx.beginPath()
      ctx.arc(-this.width / 4, this.height / 4, 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#f00"
      ctx.beginPath()
      ctx.arc(this.width / 4, this.height / 4, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    if (this.health < this.maxHealth) {
      const barWidth = this.width
      const barHeight = 3
      const healthPercent = this.health / this.maxHealth

      ctx.fillStyle = "#300"
      ctx.fillRect(-barWidth / 2, this.height / 2 + 5, barWidth, barHeight)

      ctx.fillStyle = healthPercent > 0.5 ? "#0f0" : healthPercent > 0.25 ? "#ff0" : "#f00"
      ctx.fillRect(-barWidth / 2, this.height / 2 + 5, barWidth * healthPercent, barHeight)
    }

    ctx.restore()
  }

  private shadeColor(color: string, percent: number): string {
    const num = Number.parseInt(color.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    )
  }
}

