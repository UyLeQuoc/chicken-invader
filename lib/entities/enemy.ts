export class Enemy {
  x: number
  y: number
  health: number
  type: number
  private angle = 0
  private wingFlap = 0
  public vx = 0
  public vy = 0
  public behaviorTimer = 0
  public behaviorType: "static" | "wave" | "circle" | "dive" | "zigzag" = "static"
  private initialX: number
  private initialY: number

  constructor(x: number, y: number, type = 0) {
    this.x = x
    this.y = y
    this.type = type
    this.health = type + 1
    this.initialX = x
    this.initialY = y
  }

  update(deltaTime: number) {
    this.angle += deltaTime * 0.001
    this.wingFlap += deltaTime * 0.01
    this.behaviorTimer += deltaTime

    // Apply behavior-based movement
    switch (this.behaviorType) {
      case "wave":
        // Sinusoidal horizontal movement
        this.x = this.initialX + Math.sin(this.behaviorTimer * 0.002) * 80
        this.y += this.vy * (deltaTime / 16)
        break

      case "circle":
        // Circular motion around initial position
        const radius = 60
        this.x = this.initialX + Math.cos(this.behaviorTimer * 0.001) * radius
        this.y = this.initialY + Math.sin(this.behaviorTimer * 0.001) * radius * 0.6
        break

      case "dive":
        // Dive down periodically
        if (this.behaviorTimer % 3000 < 1000) {
          this.vy = 2
        } else {
          this.vy = 0.3
          // Return to formation
          if (this.y > this.initialY) {
            this.y -= 0.5 * (deltaTime / 16)
          }
        }
        this.x += this.vx * (deltaTime / 16)
        this.y += this.vy * (deltaTime / 16)
        break

      case "zigzag":
        // Zigzag pattern
        this.x += Math.sin(this.behaviorTimer * 0.003) * 3
        this.y += this.vy * (deltaTime / 16)
        break

      case "static":
      default:
        // Gentle floating
        this.x += this.vx * (deltaTime / 16)
        this.y += this.vy * (deltaTime / 16)
        break
    }
  }

  setBehavior(behavior: "static" | "wave" | "circle" | "dive" | "zigzag", vx = 0, vy = 0) {
    this.behaviorType = behavior
    this.vx = vx
    this.vy = vy
    this.behaviorTimer = Math.random() * 1000 // Randomize start time for variety
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)

    const size = 15 + this.type * 5
    const wingOffset = Math.sin(this.wingFlap) * 5

    // Body
    ctx.fillStyle = ["#ff6b35", "#ff8c42", "#ffa600"][this.type] || "#ff6b35"
    ctx.beginPath()
    ctx.ellipse(0, 0, size, size * 0.8, 0, 0, Math.PI * 2)
    ctx.fill()

    // Wings
    ctx.fillStyle = "#ff4500"
    ctx.beginPath()
    ctx.ellipse(-size - wingOffset, 0, size * 0.6, size * 0.4, -0.3, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(size + wingOffset, 0, size * 0.6, size * 0.4, 0.3, 0, Math.PI * 2)
    ctx.fill()

    // Eyes
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(-5, -3, 3, 0, Math.PI * 2)
    ctx.arc(5, -3, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(-5, -3, 1.5, 0, Math.PI * 2)
    ctx.arc(5, -3, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Beak
    ctx.fillStyle = "#ffaa00"
    ctx.beginPath()
    ctx.moveTo(0, 2)
    ctx.lineTo(-3, 6)
    ctx.lineTo(3, 6)
    ctx.closePath()
    ctx.fill()

    // Glow effect
    ctx.shadowBlur = 10
    ctx.shadowColor = "#ff6b35"
    ctx.strokeStyle = "#ff6b35"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  }
}
