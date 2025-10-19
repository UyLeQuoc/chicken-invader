import type { PowerupType } from "../types"

export class Powerup {
  x: number
  y: number
  type: PowerupType
  radius: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  bobOffset: number
  bobSpeed: number
  color: string
  label: string

  constructor(x: number, y: number, type: PowerupType) {
    this.x = x
    this.y = y
    this.type = type
    this.radius = 15
    this.vx = 0
    this.vy = 80
    this.rotation = 0
    this.rotationSpeed = 3
    this.bobOffset = 0
    this.bobSpeed = 4

    switch (type) {
      case "weapon":
        this.color = "#f00"
        this.label = "W"
        break
      case "health":
        this.color = "#f00"
        this.label = "HP"
        break
      case "invincible":
        this.color = "#ffff00"
        this.label = "INV"
        break
      case "speed":
        this.color = "#00ffff"
        this.label = "SPD"
        break
      case "multiplier":
        this.color = "#ff00ff"
        this.label = "MUL"
        break
      case "slowmo":
        this.color = "#00ff00"
        this.label = "SLO"
        break
      case "bomb":
        this.color = "#ff8800"
        this.label = "BOM"
        break
    }
  }

  update(deltaTime: number): void {
    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    this.rotation += this.rotationSpeed * deltaTime
    this.bobOffset = Math.sin(Date.now() / 200) * 5
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    ctx.translate(this.x, this.y + this.bobOffset)

    const pulseSize = Math.sin(Date.now() / 200) * 3
    ctx.shadowColor = this.color
    ctx.shadowBlur = 20 + pulseSize

    const size = 30
    
    // Draw rotating box
    ctx.save()
    ctx.rotate(this.rotation)
    const gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2)
    gradient.addColorStop(0, this.color)
    gradient.addColorStop(1, this.shadeColor(this.color, -40))

    ctx.fillStyle = gradient
    ctx.fillRect(-size / 2, -size / 2, size, size)

    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.strokeRect(-size / 2, -size / 2, size, size)

    ctx.strokeStyle = this.shadeColor(this.color, 40)
    ctx.lineWidth = 1
    ctx.strokeRect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6)
    ctx.restore()

    // Draw emoji without rotation
    this.drawEmoji(ctx)

    // Draw sparkles with rotation
    const time = Date.now() / 500
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + time
      const dist = size / 2 + 12
      const sparkleX = Math.cos(angle) * dist
      const sparkleY = Math.sin(angle) * dist

      ctx.beginPath()
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.shadowBlur = 10
      ctx.fill()
    }

    ctx.restore()
  }

  private drawEmoji(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = "24px Arial"
    ctx.shadowColor = "#000"
    ctx.shadowBlur = 5

    let emoji = ""
    switch (this.type) {
      case "weapon":
        emoji = "⚡"
        break
      case "health":
        emoji = "❤️"
        break
      case "invincible":
        emoji = "⭐"
        break
      case "speed":
        emoji = "💨"
        break
      case "multiplier":
        emoji = "✨"
        break
      case "slowmo":
        emoji = "⏱️"
        break
      case "bomb":
        emoji = "💣"
        break
    }

    ctx.fillText(emoji, 0, 0)
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
