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
      case "firerate":
        this.color = "#00f"
        this.label = "F"
        break
      case "spread":
        this.color = "#ff0"
        this.label = "S"
        break
      case "shield":
        this.color = "#0f0"
        this.label = "SH"
        break
      case "bomb":
        this.color = "#f0f"
        this.label = "B"
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
    ctx.rotate(this.rotation)

    const pulseSize = Math.sin(Date.now() / 200) * 3
    ctx.shadowColor = this.color
    ctx.shadowBlur = 20 + pulseSize

    const size = 25
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

    // Draw icon based on type
    this.drawIcon(ctx)

    const time = Date.now() / 500
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + time
      const dist = size / 2 + 10
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

  private drawIcon(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#fff"
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.shadowColor = "#000"
    ctx.shadowBlur = 3

    switch (this.type) {
      case "weapon":
        // Lightning bolt ⚡
        ctx.beginPath()
        ctx.moveTo(-2, -8)
        ctx.lineTo(3, -1)
        ctx.lineTo(0, -1)
        ctx.lineTo(2, 8)
        ctx.lineTo(-3, 1)
        ctx.lineTo(0, 1)
        ctx.closePath()
        ctx.fill()
        break

      case "shield":
        // Shield 🛡
        ctx.beginPath()
        ctx.moveTo(0, -8)
        ctx.lineTo(6, -4)
        ctx.lineTo(6, 2)
        ctx.quadraticCurveTo(6, 6, 0, 8)
        ctx.quadraticCurveTo(-6, 6, -6, 2)
        ctx.lineTo(-6, -4)
        ctx.closePath()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, -4)
        ctx.lineTo(0, 6)
        ctx.moveTo(-4, 0)
        ctx.lineTo(4, 0)
        ctx.stroke()
        break

      case "firerate":
        // Fire 🔥
        ctx.beginPath()
        ctx.moveTo(0, -8)
        ctx.bezierCurveTo(-4, -6, -5, -2, -3, 2)
        ctx.bezierCurveTo(-2, 5, 0, 7, 0, 7)
        ctx.bezierCurveTo(0, 7, 2, 5, 3, 2)
        ctx.bezierCurveTo(5, -2, 4, -6, 0, -8)
        ctx.fill()
        // Inner flame
        ctx.fillStyle = "#ff0"
        ctx.beginPath()
        ctx.moveTo(0, -4)
        ctx.bezierCurveTo(-2, -3, -2, 0, -1, 2)
        ctx.bezierCurveTo(0, 3, 0, 4, 0, 4)
        ctx.bezierCurveTo(0, 4, 0, 3, 1, 2)
        ctx.bezierCurveTo(2, 0, 2, -3, 0, -4)
        ctx.fill()
        break

      case "spread":
        // Star ⭐
        const spikes = 5
        const outerRadius = 8
        const innerRadius = 3
        ctx.beginPath()
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (i * Math.PI) / spikes - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        break

      case "bomb":
        // Bomb 💣
        ctx.beginPath()
        ctx.arc(0, 2, 6, 0, Math.PI * 2)
        ctx.fill()
        // Fuse
        ctx.beginPath()
        ctx.moveTo(-2, -4)
        ctx.quadraticCurveTo(-4, -6, -3, -8)
        ctx.stroke()
        // Spark
        ctx.fillStyle = "#ff0"
        ctx.beginPath()
        ctx.arc(-3, -8, 2, 0, Math.PI * 2)
        ctx.fill()
        break

      case "health":
        // Heart ❤
        ctx.beginPath()
        ctx.moveTo(0, -2)
        ctx.bezierCurveTo(-4, -6, -6, -4, -6, -1)
        ctx.bezierCurveTo(-6, 2, 0, 6, 0, 6)
        ctx.bezierCurveTo(0, 6, 6, 2, 6, -1)
        ctx.bezierCurveTo(6, -4, 4, -6, 0, -2)
        ctx.fill()
        break

      case "invincible":
        // Star ⭐
        const invincibleSpikes = 5
        const invincibleOuterRadius = 8
        const invincibleInnerRadius = 3
        ctx.beginPath()
        for (let i = 0; i < invincibleSpikes * 2; i++) {
          const radius = i % 2 === 0 ? invincibleOuterRadius : invincibleInnerRadius
          const angle = (i * Math.PI) / invincibleSpikes - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        break

      case "speed":
        // Lightning bolt ⚡
        ctx.beginPath()
        ctx.moveTo(-2, -8)
        ctx.lineTo(3, -1)
        ctx.lineTo(0, -1)
        ctx.lineTo(2, 8)
        ctx.lineTo(-3, 1)
        ctx.lineTo(0, 1)
        ctx.closePath()
        ctx.fill()
        break

      case "multiplier":
        // Multiply symbol ✨
        ctx.beginPath()
        ctx.moveTo(-6, -6)
        ctx.lineTo(6, 6)
        ctx.moveTo(6, -6)
        ctx.lineTo(-6, 6)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, 8, 0, Math.PI * 2)
        ctx.stroke()
        break

      case "slowmo":
        // Hourglass ⏱
        ctx.beginPath()
        ctx.moveTo(-6, -8)
        ctx.lineTo(6, -8)
        ctx.lineTo(0, -2)
        ctx.lineTo(6, 4)
        ctx.lineTo(6, 8)
        ctx.lineTo(-6, 8)
        ctx.lineTo(-6, 4)
        ctx.lineTo(0, -2)
        ctx.lineTo(-6, -8)
        ctx.stroke()
        break
    }
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
