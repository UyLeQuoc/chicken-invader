export type PowerUpType =
  | "weapon"
  | "health"
  | "shield"
  | "explosive"
  | "invincibility"
  | "speed"
  | "firerate"
  | "multiplier"
  | "slowmo"
  | "laser"

export class PowerUp {
  x: number
  y: number
  type: PowerUpType
  color: string
  private angle = 0
  private bobOffset = 0

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x
    this.y = y
    this.type = type

    switch (type) {
      case "weapon":
        this.color = "#ff0000"
        break
      case "health":
        this.color = "#00ff00"
        break
      case "shield":
        this.color = "#00ffff"
        break
      case "explosive":
        this.color = "#ff8800"
        break
      case "invincibility":
        this.color = "#ffff00"
        break
      case "speed":
        this.color = "#ffff00"
        break
      case "firerate":
        this.color = "#ff4400"
        break
      case "multiplier":
        this.color = "#ffaa00"
        break
      case "slowmo":
        this.color = "#8800ff"
        break
      case "laser":
        this.color = "#00ff88"
        break
    }
  }

  update(deltaTime: number) {
    this.y += 2 * (deltaTime / 16)
    this.angle += deltaTime * 0.003
    this.bobOffset = Math.sin(this.angle * 2) * 3
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y + this.bobOffset)
    ctx.rotate(this.angle)

    ctx.shadowBlur = 15
    ctx.shadowColor = this.color

    ctx.fillStyle = this.color
    ctx.fillRect(-12, -12, 24, 24)

    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.strokeRect(-12, -12, 24, 24)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    let icon = "?"
    switch (this.type) {
      case "weapon":
        icon = "⚡"
        break
      case "health":
        icon = "❤"
        break
      case "shield":
        icon = "🛡"
        break
      case "explosive":
        icon = "💣"
        break
      case "invincibility":
        icon = "⭐"
        break
      case "speed":
        icon = "⚡"
        break
      case "firerate":
        icon = "🔥"
        break
      case "multiplier":
        icon = "✨"
        break
      case "slowmo":
        icon = "⏱"
        break
      case "laser":
        icon = "🔫"
        break
    }
    ctx.fillText(icon, 0, 0)

    ctx.restore()
  }
}
